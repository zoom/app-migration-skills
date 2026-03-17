import { Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { ZoomWebhookPayload, PokerSession } from '../types';
import { sendMessage, sendPollMessage, updatePollMessage } from './messaging';
import { sessionStorage } from '../app/storage';
import { generateId, parseCustomPoints, extractTitle } from '../lib/utils';

/**
 * Encrypt token for webhook validation
 */
function encryptToken(token: string, secretToken: string): string {
  return crypto.createHmac('sha256', secretToken).update(token).digest('hex');
}

/**
 * Verify webhook signature to prevent forgery
 * CRITICAL: Must be called for all non-validation events
 */
function verifyWebhookSignature(req: Request): boolean {
  const signature = req.headers['x-zm-signature'] as string;
  const timestamp = req.headers['x-zm-request-timestamp'] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !timestamp || !rawBody) {
    console.error('Missing signature headers or raw body');
    return false;
  }

  // Prevent replay attacks - reject requests older than 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - requestTime) > 300) {
    console.error('Request timestamp too old or too far in future');
    return false;
  }

  // Verify HMAC signature
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto
    .createHmac('sha256', config.zoom.webhookSecretToken)
    .update(message)
    .digest('hex');

  const expectedSignature = `v0=${hash}`;

  if (expectedSignature !== signature) {
    console.error('Invalid webhook signature');
    return false;
  }

  return true;
}

/**
 * Webhook handler for Zoom events
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    const body = req.body as ZoomWebhookPayload;

    // Handle URL validation (no signature verification needed)
    if (body.event === 'endpoint.url_validation') {
      const plainToken = body.payload.plainToken || '';
      const encryptedToken = encryptToken(plainToken, config.zoom.webhookSecretToken);

      console.log('Webhook URL validation successful');
      return res.json({
        plainToken,
        encryptedToken,
      });
    }

    // CRITICAL: Verify signature for all other events to prevent forgery
    if (!verifyWebhookSignature(req)) {
      console.error('Webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle bot notification (slash command)
    if (body.event === 'bot_notification') {
      const { userJid, userName, cmd, accountId, toJid } = body.payload;

      console.log(`Slash command from ${userName}: ${cmd}`);

      // Respond immediately to prevent Zoom retries
      res.json({ success: true });

      // Process command asynchronously (fire-and-forget)
      handleSlashCommand({
        userJid,
        userName,
        command: cmd,
        accountId,
        channelId: toJid,
      }).catch(error => {
        console.error('Error processing slash command:', error);
      });

      return;
    }

    // Handle interactive message actions (button clicks)
    if (body.event === 'interactive_message_actions') {
      const { userJid, userName, accountId, actionItem } = body.payload;

      console.log(`Button clicked by ${userName}: ${actionItem?.value}`);

      // Respond immediately
      res.json({ success: true });

      // Process action asynchronously (fire-and-forget)
      if (actionItem?.value) {
        handleButtonAction({
          userJid,
          userName,
          accountId,
          actionValue: actionItem.value,
        }).catch(error => {
          console.error('Error processing button action:', error);
        });
      }

      return;
    }

    // Handle bot installed event
    if (body.event === 'bot_installed') {
      console.log('Bot installed event received');
      return res.json({ success: true });
    }

    // Handle app deauthorized event
    if (body.event === 'app_deauthorized') {
      console.log('App deauthorized event received');
      return res.json({ success: true });
    }

    // Unknown event type
    console.log('Unsupported webhook event:', body.event);
    return res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle slash command for Poker Planner
 * Command format: /pp [title] [points:1,2,3,5,8]
 */
async function handleSlashCommand(params: {
  userJid: string;
  userName: string;
  command: string;
  accountId: string;
  channelId: string;
}) {
  const { userJid, userName, command, accountId, channelId } = params;

  try {
    // Parse command arguments
    const args = command.trim().split(' ').filter(a => a.length > 0);

    // Check for help command
    if (args.length > 0 && args[0].toLowerCase() === 'help') {
      await sendMessage(
        userJid,
        `**🃏 Planning Poker Help**\n\n` +
        `**Start a session:**\n` +
        `/pp [title] [options]\n\n` +
        `**Options:**\n` +
        `• \`points:1,2,3,5,8\` - Custom point values\n` +
        `• Default points: 0, 1, 2, 3, 5, 8, 13, 21, ?\n\n` +
        `**Examples:**\n` +
        `/pp User authentication feature\n` +
        `/pp Sprint planning points:XS,S,M,L,XL`,
        accountId
      );
      return;
    }

    // Extract title and custom points
    const title = extractTitle(args.length > 0 ? args.join(' ') : '');
    const customPoints = parseCustomPoints(args);
    const defaultPoints = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];
    const points = customPoints || defaultPoints;

    // Create new poker session
    const session: PokerSession = {
      id: generateId(),
      title,
      points,
      votes: {},
      state: 'active',
      channelId,
      teamId: accountId,
      creatorId: userJid,
      creatorName: userName,
      messageId: '', // Will be set after sending
      createdAt: Date.now(),
      protected: false,
      average: true,
      participants: [],
    };

    // Send poll message to channel
    const messageId = await sendPollMessage(session, channelId);
    session.messageId = messageId;

    // Store session
    await sessionStorage.save(session);

    console.log(`[Poker] Session created: ${session.id} by ${userName} - "${title}"`);
  } catch (error) {
    console.error('Failed to handle slash command:', error);
    await sendMessage(
      userJid,
      '❌ Failed to create planning session. Please try again.',
      accountId
    );
  }
}

/**
 * Handle button action for Poker Planner
 * Actions: vote, reveal, cancel, restart
 */
async function handleButtonAction(params: {
  userJid: string;
  userName: string;
  accountId: string;
  actionValue: string;
}) {
  const { userJid, userName, actionValue, accountId } = params;

  try {
    const action = JSON.parse(actionValue);

    if (action.action === 'vote') {
      // Handle vote action
      const session = await sessionStorage.get(action.sessionId);
      if (!session) {
        await sendMessage(userJid, '❌ Session not found or has expired', accountId);
        return;
      }

      if (session.state !== 'active') {
        await sendMessage(userJid, '⚠️ This voting session has ended', accountId);
        return;
      }

      // Record vote
      session.votes[userJid] = action.point;
      await sessionStorage.save(session);

      // Update poll message
      await updatePollMessage(session);

      console.log(`[Poker] Vote recorded: ${userName} voted ${action.point} in ${session.id}`);
    }

    else if (action.action === 'reveal') {
      // Handle reveal action
      const session = await sessionStorage.get(action.sessionId);
      if (!session) {
        await sendMessage(userJid, '❌ Session not found', accountId);
        return;
      }

      // Check if user is creator (for protected sessions)
      if (session.protected && session.creatorId !== userJid) {
        await sendMessage(userJid, '⚠️ Only the session creator can reveal votes', accountId);
        return;
      }

      // Reveal votes
      session.state = 'revealed';
      await sessionStorage.save(session);
      await updatePollMessage(session);

      console.log(`[Poker] Session revealed: ${session.id} by ${userName}`);
    }

    else if (action.action === 'cancel') {
      // Handle cancel action
      const session = await sessionStorage.get(action.sessionId);
      if (!session) {
        await sendMessage(userJid, '❌ Session not found', accountId);
        return;
      }

      // Check if user is creator (for protected sessions)
      if (session.protected && session.creatorId !== userJid) {
        await sendMessage(userJid, '⚠️ Only the session creator can cancel', accountId);
        return;
      }

      // Cancel session
      session.state = 'cancelled';
      await sessionStorage.save(session);
      await updatePollMessage(session);

      console.log(`[Poker] Session cancelled: ${session.id} by ${userName}`);
    }

    else if (action.action === 'restart') {
      // Handle restart action
      const oldSession = await sessionStorage.get(action.sessionId);
      if (!oldSession) {
        await sendMessage(userJid, '❌ Session not found', accountId);
        return;
      }

      // Create new session with same settings
      const newSession: PokerSession = {
        ...oldSession,
        id: generateId(),
        votes: {},
        state: 'active',
        messageId: '',
        createdAt: Date.now(),
      };

      const messageId = await sendPollMessage(newSession, oldSession.channelId);
      newSession.messageId = messageId;
      await sessionStorage.save(newSession);

      console.log(`[Poker] Session restarted: ${newSession.id} by ${userName}`);
    }
  } catch (error: any) {
    console.error('Failed to handle button action:', error);
  }
}
