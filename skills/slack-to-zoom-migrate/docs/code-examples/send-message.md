# Code Example: Send Message
## Slack vs Zoom Message Sending

[View full API reference](../API_MAPPING_REFERENCE.md#1-messaging-apis)

---

## Slack: chat.postMessage

```typescript
import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Simple text message
const result = await client.chat.postMessage({
  channel: 'C123456',
  text: 'Hello, world!'
});

console.log('Message sent:', result.ts);

// Message with Block Kit
await client.chat.postMessage({
  channel: 'C123456',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Bold text* and _italic text_'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Click Me' },
          action_id: 'button_click',
          value: 'button_value',
          style: 'primary'
        }
      ]
    }
  ]
});
```

---

## Zoom: POST /v2/im/chat/messages

```typescript
import axios from 'axios';

// Get bot token (client credentials)
async function getBotToken() {
  const authHeader = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    'https://zoom.us/oauth/token?grant_type=client_credentials',
    {},
    { headers: { Authorization: `Basic ${authHeader}` } }
  );

  return response.data.access_token;
}

// Simple text message
const botToken = await getBotToken();

const result = await axios.post(
  'https://api.zoom.us/v2/im/chat/messages',
  {
    robot_jid: process.env.ZOOM_BOT_JID,
    to_jid: 'channel@company.zoom.us',
    account_id: accountId,
    user_jid: userJid,
    is_markdown_support: true,  // REQUIRED!
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

// Message with markdown and button
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
          text: '**Bold text** and *italic text*'
        },
        {
          type: 'actions',
          items: [
            {
              text: 'Click Me',
              value: JSON.stringify({
                action: 'button_click',
                data: 'button_value'
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

## Key Differences

1. **OAuth:** Slack uses bot token from installation; Zoom uses client credentials
2. **Required Fields:** Zoom needs `robot_jid`, `account_id`, `user_jid`
3. **Markdown Flag:** Zoom requires `is_markdown_support: true`
4. **Message Structure:** Slack uses `blocks`; Zoom uses `content.body`
5. **Button Values:** Zoom requires JSON-stringified values
6. **Message ID:** Slack returns `ts`; Zoom returns `message_id`

---

## Migration Steps

1. Replace Slack client with axios
2. Implement client credentials OAuth
3. Add required Zoom identity fields
4. Convert `blocks` array to `content.body` array
5. Add `is_markdown_support: true`
6. Convert markdown syntax (bold, italic)
7. JSON-stringify button values
8. Store `message_id` for updates/deletes

---

**Documentation:**
- [Slack chat.postMessage](https://api.slack.com/methods/chat.postMessage)
- [Zoom sendChatMessage](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/sendChatMessage)
