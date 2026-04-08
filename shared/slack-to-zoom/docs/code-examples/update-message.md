# Code Example: Update Message

## Slack

```typescript
await client.chat.update({
  channel: 'C123',
  ts: messageTimestamp,  // From previous send
  text: 'Updated message'
});
```

## Zoom

```typescript
await axios.put(
  `https://api.zoom.us/v2/im/chat/messages/${messageId}`,  // From previous send
  {
    to_jid: 'channel@company.zoom.us',
    user_jid: userJid,
    account_id: accountId,
    is_markdown_support: true,
    content: {
      head: { text: 'Updated' },
      body: [{ type: 'message', text: 'Updated message' }]
    }
  },
  { headers: { 'Authorization': `Bearer ${botToken}` } }
);
```

**Key:** Track `message_id` (Zoom) or `ts` (Slack) from send response.

[Slack Docs](https://api.slack.com/methods/chat.update) | [Zoom Docs](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/updateMessage)
