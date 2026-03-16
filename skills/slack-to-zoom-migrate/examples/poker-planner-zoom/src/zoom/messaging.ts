import axios from 'axios';
import { config } from '../config';
import { getBotToken } from './tokens';
import { MessageBody, PokerSession } from '../types';
import { calculateAverage, formatVoteResults } from '../lib/utils';

/**
 * Send a simple text message
 */
export async function sendMessage(
  toJid: string,
  text: string,
  accountId?: string
): Promise<string> {
  const botToken = await getBotToken();

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: toJid,
    account_id: accountId || '',
    user_jid: toJid,
    is_markdown_support: true,
    content: {
      head: {
        text: config.appName,
      },
      body: [
        {
          type: 'message',
          text: text,
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `${config.zoom.apiHost}/v2/im/chat/messages`,
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const messageId = response.data.message_id || response.data.id || '';
    console.log(`Message sent successfully to ${toJid}`);
    return messageId;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

/**
 * Update an existing message
 */
export async function updateMessage(
  messageId: string,
  toJid: string,
  text: string,
  accountId?: string
): Promise<string> {
  const botToken = await getBotToken();

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: toJid,
    account_id: accountId || '',
    user_jid: toJid,
    is_markdown_support: true,
    content: {
      head: {
        text: config.appName,
      },
      body: [
        {
          type: 'message',
          text: text,
        },
      ],
    },
  };

  try {
    const response = await axios.put(
      `${config.zoom.apiHost}/v2/im/chat/messages/${messageId}`,
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Message updated successfully: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error('Failed to update message:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const botToken = await getBotToken();

  try {
    await axios.delete(
      `${config.zoom.apiHost}/v2/im/chat/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      }
    );

    console.log(`Message deleted: ${messageId}`);
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw error;
  }
}

/**
 * Send a poker planning poll message
 */
export async function sendPollMessage(session: PokerSession, channelId: string): Promise<string> {
  const botToken = await getBotToken();

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: channelId,
    account_id: session.teamId,
    user_jid: session.creatorId,
    is_markdown_support: true,
    content: {
      head: {
        text: '🃏 Planning Poker',
      },
      body: buildPollMessageBody(session),
    },
  };

  try {
    const response = await axios.post(
      `${config.zoom.apiHost}/v2/im/chat/messages`,
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const messageId = response.data.message_id || response.data.id || '';
    console.log(`[Poker] Poll message sent to channel ${channelId}`);
    return messageId;
  } catch (error) {
    console.error('Failed to send poll message:', error);
    throw error;
  }
}

/**
 * Update an existing poker planning poll message
 */
export async function updatePollMessage(session: PokerSession): Promise<void> {
  const botToken = await getBotToken();

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: session.channelId,
    account_id: session.teamId,
    user_jid: session.creatorId,
    is_markdown_support: true,
    content: {
      head: {
        text: '🃏 Planning Poker',
      },
      body: buildPollMessageBody(session),
    },
  };

  try {
    await axios.put(
      `${config.zoom.apiHost}/v2/im/chat/messages/${session.messageId}`,
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[Poker] Poll message updated: ${session.messageId}`);
  } catch (error) {
    console.error('Failed to update poll message:', error);
    throw error;
  }
}

/**
 * Build the message body for a poker planning poll
 */
function buildPollMessageBody(session: PokerSession): any[] {
  const body: any[] = [];

  // Title - Big and bold
  body.push({
    type: 'message',
    text: `*🎯 ${session.title}*`,
  });

  // Separator
  body.push({
    type: 'message',
    text: `━━━━━━━━━━━━━━━━━━━━`,
  });

  // Creator info
  body.push({
    type: 'message',
    text: `👤 _Created by ${session.creatorName}_`,
  });

  // State-specific content
  if (session.state === 'revealed') {
    // Revealed state - show results
    body.push({
      type: 'message',
      text: `\n*✨ Results Revealed ✨*\n`,
    });

    if (Object.keys(session.votes).length > 0) {
      body.push({
        type: 'message',
        text: formatVoteResults(session.votes),
      });

      // Show average if available
      const avg = calculateAverage(session.votes);
      if (avg !== null) {
        body.push({
          type: 'message',
          text: `\n📊 *Average: ${avg.toFixed(1)} points*`,
        });
      }
    } else {
      body.push({
        type: 'message',
        text: `_No votes were cast_`,
      });
    }
  } else if (session.state === 'cancelled') {
    // Cancelled state
    body.push({
      type: 'message',
      text: `\n*❌ Session Cancelled*\n_This estimation session has been closed_`,
    });
  } else {
    // Active state - show voting status
    const voteCount = Object.keys(session.votes).length;
    body.push({
      type: 'message',
      text: `\n*📊 Voting Status*\n${voteCount} vote(s) cast 🗳️`,
    });

    // Voting buttons
    body.push({
      type: 'message',
      text: `\n*🎲 Cast Your Vote:*`,
    });

    // Create button rows (5 buttons per row for better layout)
    const buttonRows: string[][] = [];
    let currentRow: string[] = [];

    session.points.forEach((point, index) => {
      currentRow.push(point);
      if (currentRow.length === 5 || index === session.points.length - 1) {
        buttonRows.push([...currentRow]);
        currentRow = [];
      }
    });

    // Add voting button rows
    buttonRows.forEach((row) => {
      body.push({
        type: 'actions',
        items: row.map((point) => ({
          text: point,
          value: JSON.stringify({ action: 'vote', sessionId: session.id, point }),
          style: 'Default',
        })),
      });
    });

    // Separator before action buttons
    body.push({
      type: 'message',
      text: `━━━━━━━━━━━━━━━━━━━━`,
    });
  }

  // Action buttons based on state
  if (session.state === 'active') {
    // Active: Show reveal and cancel buttons
    body.push({
      type: 'actions',
      items: [
        {
          text: '👁 Reveal',
          value: JSON.stringify({ action: 'reveal', sessionId: session.id }),
          style: 'Primary',
        },
        {
          text: '❌ Cancel',
          value: JSON.stringify({ action: 'cancel', sessionId: session.id }),
          style: 'Danger',
        },
      ],
    });
  } else if (session.state === 'revealed' || session.state === 'cancelled') {
    // Ended: Show restart button
    body.push({
      type: 'actions',
      items: [
        {
          text: '🔄 Restart',
          value: JSON.stringify({ action: 'restart', sessionId: session.id }),
          style: 'Primary',
        },
      ],
    });
  }

  return body;
}
