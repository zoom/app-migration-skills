# Messaging API Deep Dive
## Slack to Zoom Message Sending Comparison

**Status:** Production Ready
**Compatibility:** 90% ✅
**Last Updated:** 2026-02-18

---

## Overview

This guide provides detailed mapping between Slack's chat APIs and Zoom's messaging endpoints.

---

## Core Methods Comparison

### Send Message

| Platform | Method | Documentation |
|----------|--------|---------------|
| Slack | `chat.postMessage` | [📖 Docs](https://api.slack.com/methods/chat.postMessage) |
| Zoom | `POST /v2/im/chat/messages` | [📖 Docs](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/sendChatMessage) |

### Update Message

| Platform | Method | Documentation |
|----------|--------|---------------|
| Slack | `chat.update` | [📖 Docs](https://api.slack.com/methods/chat.update) |
| Zoom | `PUT /v2/im/chat/messages/{id}` | [📖 Docs](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/updateMessage) |

### Delete Message

| Platform | Method | Documentation |
|----------|--------|---------------|
| Slack | `chat.delete` | [📖 Docs](https://api.slack.com/methods/chat.delete) |
| Zoom | `DELETE /v2/im/chat/messages/{id}` | [📖 Docs](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/deleteMessage) |

---

## Parameter Mapping: Send Message

### Slack Parameters

```typescript
interface SlackPostMessage {
  channel: string;              // Required: Channel ID
  text?: string;                // Fallback text
  blocks?: Block[];             // Block Kit blocks
  thread_ts?: string;           // Thread timestamp
  mrkdwn?: boolean;             // Enable markdown (default: true)
  link_names?: boolean;         // Link channel/user names
  parse?: 'full' | 'none';      // Parsing mode
  unfurl_links?: boolean;       // Auto-unfurl links
  unfurl_media?: boolean;       // Auto-unfurl media
  icon_emoji?: string;          // Bot icon emoji
  icon_url?: string;            // Bot icon URL
  username?: string;            // Bot display name
  as_user?: boolean;            // Post as authed user
}
```

### Zoom Parameters

```typescript
interface ZoomSendMessage {
  robot_jid: string;            // Required: Bot JID
  to_jid: string;               // Required: Channel/user JID
  account_id: string;           // Required: Account ID
  user_jid?: string;            // Optional: User JID (triggering user)
  is_markdown_support: boolean; // Required: true
  content: {
    head: { text: string };     // Message title
    body: MessageBody[];        // Message content
  };
}

interface MessageBody {
  type: 'message' | 'actions' | 'fields';
  text?: string;
  items?: ActionItem[];
  // ... other properties
}
```

### Direct Mapping

| Slack | Zoom | Required | Notes |
|-------|------|----------|-------|
| `channel` | `to_jid` | ✅ | Format change: C123 → channel@zoom.us |
| `text` | `content.body[].text` | ✅ | Can have multiple body items |
| `blocks` | `content.body` | ❌ | Requires conversion |
| `thread_ts` | ❌ Not supported | ❌ | Threading not available |
| `mrkdwn` | `is_markdown_support` | ✅ | Always true in Zoom |
| ❌ | `robot_jid` | ✅ | Zoom-specific: bot identity |
| ❌ | `account_id` | ✅ | Zoom-specific: from webhook |
| ❌ | `user_jid` | ❌ | Zoom-specific: triggering user |
| ❌ | `content.head.text` | ❌ | Zoom-specific: message title |

---

## Code Examples

### Slack: Send Simple Message

```typescript
import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

const result = await client.chat.postMessage({
  channel: 'C123456',
  text: 'Hello, world!'
});

console.log('Message sent:', result.ts);
```

### Zoom: Send Simple Message

```typescript
import axios from 'axios';

const botToken = await getBotToken();

const result = await axios.post(
  'https://api.zoom.us/v2/im/chat/messages',
  {
    robot_jid: process.env.ZOOM_BOT_JID,
    to_jid: 'channel@company.zoom.us',
    account_id: accountId,
    user_jid: userJid,
    is_markdown_support: true,
    content: {
      head: { text: 'Notification' },
      body: [
        {
          type: 'message',
          text: 'Hello, world!'
        }
      ]
    }
  },
  {
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json'
    }
  }
);

console.log('Message sent:', result.data.message_id);
```

---

## Advanced Features

### Slack: Message with Blocks

```typescript
await client.chat.postMessage({
  channel: 'C123456',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Important Update*\nNew feature released!'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Learn More' },
          action_id: 'learn_more',
          value: 'feature_123'
        }
      ]
    }
  ]
});
```

### Zoom: Equivalent Message

```typescript
await axios.post(
  'https://api.zoom.us/v2/im/chat/messages',
  {
    robot_jid: process.env.ZOOM_BOT_JID,
    to_jid: 'channel@company.zoom.us',
    account_id: accountId,
    user_jid: userJid,
    is_markdown_support: true,
    content: {
      head: { text: 'Important Update' },
      body: [
        {
          type: 'message',
          text: '**Important Update**\nNew feature released!'
        },
        {
          type: 'actions',
          items: [
            {
              text: 'Learn More',
              value: JSON.stringify({
                action: 'learn_more',
                feature_id: 'feature_123'
              }),
              style: 'Primary'
            }
          ]
        }
      ]
    }
  },
  { headers: { 'Authorization': `Bearer ${botToken}` } }
);
```

---

## Update Message

### Slack: Update Message

```typescript
// Keep track of message timestamp from send
const { ts } = await client.chat.postMessage({
  channel: 'C123456',
  text: 'Initial message'
});

// Update the message
await client.chat.update({
  channel: 'C123456',
  ts: ts,
  text: 'Updated message'
});
```

### Zoom: Update Message

```typescript
// Keep track of message_id from send
const { data } = await axios.post(
  'https://api.zoom.us/v2/im/chat/messages',
  { /* ... initial message */ }
);

const messageId = data.message_id;

// Update the message
await axios.put(
  `https://api.zoom.us/v2/im/chat/messages/${messageId}`,
  {
    to_jid: 'channel@company.zoom.us',
    user_jid: userJid,
    account_id: accountId,
    is_markdown_support: true,
    content: {
      head: { text: 'Updated' },
      body: [
        { type: 'message', text: 'Updated message' }
      ]
    }
  },
  { headers: { 'Authorization': `Bearer ${botToken}` } }
);
```

**Key Difference:** Slack uses `ts` (timestamp), Zoom uses `message_id` (UUID).

---

## Delete Message

### Both Platforms

**Slack:**
```typescript
await client.chat.delete({
  channel: 'C123456',
  ts: messageTimestamp
});
```

**Zoom:**
```typescript
await axios.delete(
  `https://api.zoom.us/v2/im/chat/messages/${messageId}`,
  {
    params: {
      to_jid: 'channel@company.zoom.us',
      user_jid: userJid,
      account_id: accountId
    },
    headers: { 'Authorization': `Bearer ${botToken}` }
  }
);
```

---

## Common Pitfalls

### 1. Missing `is_markdown_support` (Zoom)

❌ **Wrong:**
```typescript
content: {
  body: [{ type: 'message', text: '**Bold**' }]
}
// Result: Markdown not rendered
```

✅ **Correct:**
```typescript
{
  is_markdown_support: true,  // REQUIRED!
  content: {
    body: [{ type: 'message', text: '**Bold**' }]
  }
}
```

### 2. Forgetting Message ID Tracking (Zoom)

❌ **Wrong:**
```typescript
await sendMessage(...);
// Later: Cannot update/delete (no message_id tracked)
```

✅ **Correct:**
```typescript
const { data } = await sendMessage(...);
await db.saveMessageId(data.message_id, context);
// Later: Can update/delete using stored message_id
```

### 3. Slack Threading (Not Supported in Zoom)

❌ **Cannot Migrate:**
```typescript
// Slack: Thread support
await client.chat.postMessage({
  channel: 'C123',
  text: 'Reply',
  thread_ts: '1234567890.123'  // Thread!
});
```

⚠️ **Zoom Workaround:**
```typescript
// Option 1: Include context in message
await sendMessage({
  text: `↩️ Re: Previous message\n\nReply content`
});

// Option 2: Store conversation state externally
```

---

## Migration Checklist

When migrating message sending code:

- [ ] Replace `channel` with `to_jid` (update ID format)
- [ ] Add required Zoom fields: `robot_jid`, `account_id`, `user_jid`
- [ ] Add `is_markdown_support: true`
- [ ] Convert `blocks` array to `content.body` array
- [ ] Add `content.head.text` (message title)
- [ ] Update OAuth to client_credentials flow
- [ ] Track `message_id` from response (not `ts`)
- [ ] Remove threading logic (not supported)
- [ ] Convert Block Kit to markdown where needed
- [ ] Test message update/delete functionality

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md) - Complete mapping guide
- [Code Example: Send Message](../code-examples/send-message.md) - Full working example
- [Formatting Guide](formatting.md) - Block Kit to Markdown conversion
- [Zoom Docs](../ZOOM_OFFICIAL_DOCS.md) - All Zoom API links
