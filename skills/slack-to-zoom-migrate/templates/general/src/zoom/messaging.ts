import { httpClient } from './http-client';
import { config } from '../config';
import { getBotToken } from './tokens';
import { MessageBody } from '../types';

/**
 * Zoom message types for rich interactive messages
 */
export interface ZoomButton {
  text: string;
  value: string;
  style?: 'Primary' | 'Default' | 'Danger';
}

export interface ZoomMessage {
  head: { text: string };
  body: any[];
  buttons?: ZoomButton[];
}

/**
 * Send a message (simple text or rich message with buttons)
 *
 * Usage patterns:
 * - Bot's space (private to user): sendMessage(userJid, message, accountId)
 *   → Both to_jid and user_jid will be userJid (goes to bot's space)
 *
 * - Channel (visible to all): sendMessage(channelJid, message, accountId, userJid)
 *   → to_jid is channel, user_jid is initiating user (visible to everyone)
 */
export async function sendMessage(
  toJid: string,
  message: string | ZoomMessage,
  accountId?: string,
  userJid?: string
): Promise<string> {
  const botToken = await getBotToken();

  // Convert simple text to message format
  const messageContent: ZoomMessage =
    typeof message === 'string'
      ? {
          head: { text: config.appName },
          body: [{ type: 'message', text: message }],
        }
      : message;

  // Build message body with buttons if provided
  const bodyContent: any[] = [...messageContent.body];

  // Add buttons if provided (chunked into rows of 5)
  if (messageContent.buttons && messageContent.buttons.length > 0) {
    // Add separator before buttons
    bodyContent.push({
      type: 'message',
      text: `━━━━━━━━━━━━━━━━━━━━`,
    });

    // Chunk buttons into rows of 5
    for (let i = 0; i < messageContent.buttons.length; i += 5) {
      const row = messageContent.buttons.slice(i, i + 5);
      bodyContent.push({
        type: 'actions',
        items: row.map(btn => ({
          text: btn.text,
          value: btn.value,
          style: btn.style || 'Default',
        })),
      });
    }
  }

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: toJid,
    account_id: accountId || '',
    user_jid: userJid || toJid, // Use provided userJid for channels, fallback to toJid for bot's space
    is_markdown_support: true,
    content: {
      head: { text: messageContent.head.text },
      body: bodyContent,
    },
  };

  try {
    const response = await httpClient.post(
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
 *
 * For channel messages, provide both toJid and userJid parameters.
 * For bot's space messages, only messageId and message are needed.
 */
export async function updateMessage(
  messageId: string,
  message: ZoomMessage,
  accountId?: string,
  toJid?: string,
  userJid?: string
): Promise<string> {
  const botToken = await getBotToken();

  // Build message body with buttons if provided
  const bodyContent: any[] = [...message.body];

  // Add buttons if provided (chunked into rows of 5)
  if (message.buttons && message.buttons.length > 0) {
    // Add separator before buttons
    bodyContent.push({
      type: 'message',
      text: `━━━━━━━━━━━━━━━━━━━━`,
    });

    // Chunk buttons into rows of 5
    for (let i = 0; i < message.buttons.length; i += 5) {
      const row = message.buttons.slice(i, i + 5);
      bodyContent.push({
        type: 'actions',
        items: row.map(btn => ({
          text: btn.text,
          value: btn.value,
          style: btn.style || 'Default',
        })),
      });
    }
  }

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    account_id: accountId || '',
    is_markdown_support: true,
    content: {
      head: { text: message.head.text },
      body: bodyContent,
    },
  };

  // Add to_jid and user_jid if provided (required for channel messages)
  if (toJid) {
    messageBody.to_jid = toJid;
  }
  if (userJid) {
    messageBody.user_jid = userJid;
  }

  try {
    const response = await httpClient.put(
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
    await httpClient.delete(
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
 * RICH FORMATTING EXAMPLE
 *
 * This example demonstrates best practices for creating rich, engaging messages
 * in Zoom Team Chat using markdown and proper structure.
 *
 * Official Zoom Docs: https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/
 *
 * Key patterns:
 * 1. Use visual separators (━━━) to break up sections
 * 2. Bold titles with emojis (*🎯 Title*) - NOTE: Single asterisk for bold!
 * 3. Show individual status/results, not just counts
 * 4. Use meaningful emojis throughout (👤, 📊, ✅, etc.)
 * 5. Chunk buttons into rows of 5 for better layout
 * 6. Add context with italics (_Created by Alice_)
 *
 * CRITICAL: Zoom uses single asterisk for bold (*text*), NOT double (**text**)
 *
 * For channel messages visible to everyone, pass userJid as 4th parameter.
 * For bot's space (private), omit userJid or set it equal to toJid.
 */
export async function sendRichMessage(
  toJid: string,
  accountId: string,
  data: {
    title: string;
    creator?: string;
    status?: string;
    items?: { label: string; value: string; icon?: string }[];
    actions?: { text: string; value: string; style?: 'Primary' | 'Default' | 'Danger' }[];
  },
  userJid?: string
): Promise<string> {
  const botToken = await getBotToken();

  // Build rich message body
  const body: any[] = [];

  // Title - Big and bold with emoji (single asterisk for bold!)
  body.push({
    type: 'message',
    text: `*🎯 ${data.title}*`,
  });

  // Visual separator
  body.push({
    type: 'message',
    text: `━━━━━━━━━━━━━━━━━━━━`,
  });

  // Creator info (if provided)
  if (data.creator) {
    body.push({
      type: 'message',
      text: `👤 _Created by ${data.creator}_`,
    });
  }

  // Status section (if provided)
  if (data.status) {
    body.push({
      type: 'message',
      text: `\n*📊 Status*\n${data.status}`,
    });
  }

  // Individual items (if provided) - show details, not just counts
  if (data.items && data.items.length > 0) {
    body.push({
      type: 'message',
      text: `\n*Items:*`,
    });

    const itemsText = data.items
      .map(item => `${item.icon || '•'} *${item.label}*: ${item.value}`)
      .join('\n');

    body.push({
      type: 'message',
      text: itemsText,
    });
  }

  // Action buttons (chunked into rows of 5)
  if (data.actions && data.actions.length > 0) {
    body.push({
      type: 'message',
      text: `━━━━━━━━━━━━━━━━━━━━`,
    });

    // Chunk buttons into rows of 5
    const buttonRows: typeof data.actions[] = [];
    for (let i = 0; i < data.actions.length; i += 5) {
      buttonRows.push(data.actions.slice(i, i + 5));
    }

    buttonRows.forEach(row => {
      body.push({
        type: 'actions',
        items: row.map(action => ({
          text: action.text,
          value: action.value,
          style: action.style || 'Default',
        })),
      });
    });
  }

  const messageBody: any = {
    robot_jid: config.zoom.botJid,
    to_jid: toJid,
    account_id: accountId || '',
    user_jid: userJid || toJid, // Use provided userJid for channels, fallback to toJid for bot's space
    is_markdown_support: true,
    content: {
      head: {
        text: config.appName,
      },
      body: body,
    },
  };

  try {
    const response = await httpClient.post(
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
    console.log(`Rich message sent successfully to ${toJid}`);
    return messageId;
  } catch (error) {
    console.error('Failed to send rich message:', error);
    throw error;
  }
}
