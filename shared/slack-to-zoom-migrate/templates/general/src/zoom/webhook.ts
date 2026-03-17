import { Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { ZoomWebhookPayload } from '../types';
import { sendMessage } from './messaging';

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
      const { userJid, userName, accountId, actionItem, toJid } = body.payload;

      console.log(`Button clicked by ${userName}: ${actionItem?.value}`);

      // Respond immediately
      res.json({ success: true });

      // Process action asynchronously (fire-and-forget)
      if (actionItem?.value) {
        handleButtonAction({
          userJid,
          userName,
          accountId,
          channelId: toJid,
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
 * Handle slash command
 * TODO: Implement your command logic here
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
    // Example: Echo the command back to the user
    await sendMessage(
      userJid,
      `Hello ${userName}! You ran the command: ${command}`,
      accountId
    );

    // TODO: Add your app-specific command handling logic here
    // REMEMBER: If creating sessions/polls, store userName!
    console.log(`Command processed for ${userName}: "${command}"`);
  } catch (error) {
    console.error('Failed to handle slash command:', error);
    await sendMessage(
      userJid,
      '❌ Failed to process command. Please try again.',
      accountId
    );
  }
}

/**
 * Handle button action
 * TODO: Implement your button action logic here
 */
async function handleButtonAction(params: {
  userJid: string;
  userName: string;
  accountId: string;
  channelId: string;
  actionValue: string;
}) {
  const { userJid, userName, channelId, actionValue } = params;

  try {
    const action = JSON.parse(actionValue);

    // TODO: Add your app-specific button handling logic here
    // REMEMBER: If storing user data, include userName!
    // Example:
    //   userResponses[userJid] = { userName, response: action.value };

    console.log(`Button action processed for ${userName}:`, action);
  } catch (error: any) {
    console.error('Failed to handle button action:', error);
  }
}
