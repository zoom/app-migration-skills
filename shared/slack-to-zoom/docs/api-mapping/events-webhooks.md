# Events & Webhooks Deep Dive
## Slack Events API vs Zoom Webhook Events

**Status:** Production Ready
**Compatibility:** 60% ⚠️ (Critical Limitations)
**Last Updated:** 2026-02-18

---

## Overview

Slack and Zoom use fundamentally different event architectures:
- **Slack:** Rich event subscriptions with passive listening
- **Zoom:** Limited webhook events, no passive listening

---

## Architecture Comparison

### Slack Events API

**Documentation:** [Events API](https://api.slack.com/events-api)

**Architecture:**
- Subscribe to 50+ event types
- Passive message listening (all channel messages)
- Event retries (up to 3 times)
- Challenge-token verification

**Common Events:**
- `message` - Any message posted
- `app_mention` - Bot mentioned
- `reaction_added` - Reaction to message
- `member_joined_channel` - User joins
- Many more...

### Zoom Webhook Events

**Documentation:** [Chatbot Webhooks](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/)

**Architecture:**
- 5 webhook event types only
- No passive listening (only @mentions + commands)
- Fire-and-forget (no retries)
- HMAC signature validation

**Available Events:**
- `bot_notification` - Slash command or @mention
- `interactive_message_actions` - Button clicked
- `endpoint.url_validation` - Initial verification
- `bot_installed` - App installed
- `app_deauthorized` - App uninstalled

---

## Event Mapping Table

| Slack Event | Zoom Event | Compatibility | Documentation |
|-------------|------------|---------------|---------------|
| Slash command | `bot_notification` | 100% ✅ | [Zoom](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/#bot_notification) |
| `app_mention` | `bot_notification` (@mention) | 80% ✅ | [Slack](https://api.slack.com/events/app_mention) |
| Button/action | `interactive_message_actions` | 90% ✅ | [Zoom](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/#interactive_message_actions) |
| `url_verification` | `endpoint.url_validation` | 100% ✅ | [Zoom](https://developers.zoom.us/docs/api/webhooks/#validating-your-webhook-endpoint) |
| `message` (passive) | ❌ Not available | 0% ❌ | N/A |
| `reaction_added` | ❌ Not available | 0% ❌ | N/A |
| `member_joined_channel` | ❌ Not available | 0% ❌ | N/A |
| `file_shared` | ❌ Not available | 0% ❌ | N/A |

---

## Critical Limitation: Passive Listening

### Slack: Full Passive Listening

```typescript
// Slack can receive ALL messages in channels
app.event('message', async ({ event, client }) => {
  // Triggered for EVERY message in channels where app is installed
  console.log(`Message from ${event.user}: ${event.text}`);

  // Can analyze, moderate, log, react to ANY message
});
```

### Zoom: No Passive Listening

```typescript
// Zoom ONLY receives:
// 1. Slash commands: /command
// 2. @mentions: @BotName hello

// Cannot receive regular channel messages
app.event('bot_notification', async ({ payload }) => {
  // Only triggered when:
  // - User runs slash command: /command
  // - User @mentions bot: @BotName help
});
```

**Impact:**
- ❌ Cannot build moderation bots (scanning messages)
- ❌ Cannot build analytics bots (message patterns)
- ❌ Cannot auto-respond to keywords
- ❌ Cannot monitor channel activity
- ❌ Cannot provide ambient intelligence

**Workaround:** Require users to explicitly invoke bot via commands or @mentions.

---

## Payload Comparison

### bot_notification (Slash Command)

**Slack:**
```typescript
{
  command: "/vote",
  text: "Should we order pizza?",
  user_id: "U123",
  user_name: "john",
  channel_id: "C123",
  channel_name: "general",
  trigger_id: "12345.67890",
  response_url: "https://hooks.slack.com/..."
}
```

**Zoom:**
```typescript
{
  event: "bot_notification",
  payload: {
    cmd: "/vote Should we order pizza?",  // Full command string
    userJid: "john@company.zoom.us",
    userName: "John Doe",
    toJid: "channel@company.zoom.us",
    channelName: "general",
    accountId: "abc123",
    timestamp: 1234567890000
  }
}
```

### interactive_message_actions (Button Click)

**Slack:**
```typescript
{
  type: "block_actions",
  user: { id: "U123", name: "john" },
  channel: { id: "C123", name: "general" },
  actions: [
    {
      action_id: "button_click",
      value: "button_value",
      type: "button"
    }
  ],
  message: { /* original message */ },
  response_url: "https://hooks.slack.com/..."
}
```

**Zoom:**
```typescript
{
  event: "interactive_message_actions",
  payload: {
    actionItem: {
      text: "Click Me",
      value: "{\"action\":\"button_click\",\"data\":\"button_value\"}"
    },
    userJid: "john@company.zoom.us",
    userName: "John Doe",
    toJid: "channel@company.zoom.us",
    accountId: "abc123",
    messageId: "msg-uuid-123"
  }
}
```

---

## Webhook Verification

### Slack: Challenge Token

**Documentation:** [URL Verification](https://api.slack.com/events-api#url_verification)

```typescript
// Initial verification
if (body.type === 'url_verification') {
  return res.json({ challenge: body.challenge });
}

// Ongoing verification: HMAC signature
const signature = req.headers['x-slack-signature'];
const timestamp = req.headers['x-slack-request-timestamp'];

const message = `v0:${timestamp}:${rawBody}`;
const hash = crypto
  .createHmac('sha256', SLACK_SIGNING_SECRET)
  .update(message)
  .digest('hex');

if (`v0=${hash}` !== signature) {
  throw new Error('Invalid signature');
}
```

### Zoom: HMAC Signature

**Documentation:** [Webhook Validation](https://developers.zoom.us/docs/api/webhooks/#validating-your-webhook-endpoint)

```typescript
// Initial verification
if (body.event === 'endpoint.url_validation') {
  const response = {
    plainToken: body.payload.plainToken,
    encryptedToken: crypto
      .createHmac('sha256', ZOOM_SECRET_TOKEN)
      .update(body.payload.plainToken)
      .digest('hex')
  };
  return res.json(response);
}

// Ongoing verification: HMAC signature
const signature = req.headers['x-zm-signature'];
const timestamp = req.headers['x-zm-request-timestamp'];

const message = `v0:${timestamp}:${JSON.stringify(body)}`;
const hash = crypto
  .createHmac('sha256', ZOOM_SECRET_TOKEN)
  .update(message)
  .digest('hex');

if (`v0=${hash}` !== signature) {
  throw new Error('Invalid signature');
}
```

---

## Response Patterns

### Slack: Synchronous or Async

```typescript
app.command('/vote', async ({ ack, command, client }) => {
  // Acknowledge within 3 seconds
  await ack();

  // Process asynchronously
  await processVote(command);
});
```

### Zoom: Fire-and-Forget

```typescript
app.post('/webhooks/zoom', async (req, res) => {
  // MUST respond immediately with 200
  res.json({ success: true });

  // Process asynchronously (don't await)
  handleWebhook(req.body).catch(console.error);
});
```

**Critical:** Zoom webhooks MUST respond with 200 immediately. Don't wait for processing.

---

## Migration Checklist

- [ ] Identify passive listening events (will not migrate)
- [ ] Convert `app_mention` to `bot_notification` with @mention check
- [ ] Update webhook verification (challenge → HMAC)
- [ ] Change response pattern (sync → fire-and-forget)
- [ ] Parse `cmd` field (full command string, not separate fields)
- [ ] Update button value parsing (JSON.parse required)
- [ ] Remove event retry logic (Zoom doesn't retry)
- [ ] Test webhook validation endpoint
- [ ] Handle `endpoint.url_validation` event
- [ ] Update logging for new event structure

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md#2-events--webhooks)
- [Code Example: Webhook Validation](../code-examples/webhook-validation.md)
- [Slash Commands Guide](slash-commands.md)
- [Interactivity Guide](interactivity.md)
