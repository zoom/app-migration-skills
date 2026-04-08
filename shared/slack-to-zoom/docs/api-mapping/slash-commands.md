# Slash Commands Deep Dive
## Slack vs Zoom Command Implementation

**Status:** Production Ready
**Compatibility:** 100% ✅
**Last Updated:** 2026-02-18

---

## Overview

Both platforms support slash commands with similar functionality.

**Documentation:**
- [Slack Slash Commands](https://api.slack.com/interactivity/slash-commands)
- [Zoom Slash Commands](https://developers.zoom.us/docs/team-chat/chatbot/extend/slash-commands-in-Zoom/)

---

## Command Definition

### Slack

- Define in app manifest or app settings
- Each command has separate request URL
- Format: `/command-name [args]`

### Zoom

- Define in bot settings (Zoom Marketplace)
- All commands go to single bot endpoint
- Format: `/command-name [args]`

---

## Payload Comparison

| Field | Slack | Zoom |
|-------|-------|------|
| Command | `command` field | Part of `cmd` string |
| Arguments | `text` field | Part of `cmd` string |
| User ID | `user_id` (U123) | `userJid` (user@zoom.us) |
| Channel ID | `channel_id` (C123) | `toJid` (channel@zoom.us) |
| Trigger ID | ✅ Provided | ❌ Not available |

**Slack:**
```json
{
  "command": "/vote",
  "text": "Should we order pizza?",
  "user_id": "U123",
  "channel_id": "C123",
  "trigger_id": "12345.67890"
}
```

**Zoom:**
```json
{
  "event": "bot_notification",
  "payload": {
    "cmd": "/vote Should we order pizza?",
    "userJid": "user@company.zoom.us",
    "toJid": "channel@company.zoom.us",
    "accountId": "abc123"
  }
}
```

---

## Command Parsing

### Slack (Built-in)

```typescript
app.command('/vote', async ({ command, ack }) => {
  await ack();
  
  const args = command.text;  // Already parsed!
  console.log('Command:', command.command);
  console.log('Args:', args);
});
```

### Zoom (Manual Parsing)

```typescript
app.post('/webhooks/zoom', async (req, res) => {
  res.json({ success: true });
  
  const { cmd } = req.body.payload;
  
  // Manual parsing required
  const [command, ...argsParts] = cmd.split(' ');
  const args = argsParts.join(' ');
  
  console.log('Command:', command);  // "/vote"
  console.log('Args:', args);        // "Should we order pizza?"
  
  if (command === '/vote') {
    await handleVote(args, req.body.payload);
  }
});
```

---

## Response Patterns

### Slack: 3-Second Timeout

```typescript
app.command('/vote', async ({ command, ack, respond }) => {
  // Must acknowledge within 3 seconds
  await ack();
  
  // Can respond later
  await respond({
    text: 'Vote created!',
    response_type: 'in_channel'
  });
});
```

### Zoom: Fire-and-Forget

```typescript
app.post('/webhooks/zoom', async (req, res) => {
  // Respond immediately
  res.json({ success: true });
  
  // Process asynchronously
  processCommand(req.body.payload).catch(console.error);
});

async function processCommand(payload) {
  // Send response via messaging API
  await sendMessage({
    to_jid: payload.toJid,
    text: 'Vote created!'
  });
}
```

---

## Migration Checklist

- [ ] Consolidate command endpoints (all to webhook)
- [ ] Add command parsing logic (split `cmd` string)
- [ ] Update user/channel ID format
- [ ] Remove trigger_id usage (modals)
- [ ] Change response pattern (sync ack → async message)
- [ ] Test command parsing with various inputs
- [ ] Handle commands without arguments
- [ ] Update command documentation for users

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md#6-slash-commands)
- [Code Example: Slash Commands](../code-examples/slash-commands.md)
- [Events & Webhooks](events-webhooks.md)
