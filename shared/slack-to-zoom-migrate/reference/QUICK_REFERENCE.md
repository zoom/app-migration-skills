# Quick Reference - Slack to Zoom Migration

One-page cheatsheet for Slack → Zoom Team Chat API mapping.

---

## Core API Mappings

| Feature | Slack | Zoom | Compatibility |
|---------|-------|------|---------------|
| **Send Message** | `chat.postMessage` | `POST /v2/im/chat/messages` | ✅ 100% |
| **Update Message** | `chat.update` | `PUT /v2/im/chat/messages/{id}` | ⚠️ Need message_id |
| **Delete Message** | `chat.delete` | `DELETE /v2/im/chat/messages/{id}` | ⚠️ Need message_id |
| **Slash Commands** | `/command` | `bot_notification` event | ✅ 100% |
| **Button Clicks** | `block_actions` | `interactive_message_actions` | ✅ 100% |
| **Modals** | `views.open` | ❌ Not available | ❌ 0% |
| **OAuth** | OAuth 2.0 | Server-to-Server OAuth | ✅ 95% |

---

## Message Format

### Slack (Block Kit)
```json
{
  "channel": "C123",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "**Bold** _italic_"
      }
    }
  ]
}
```

### Zoom (Message Cards)
```json
{
  "robot_jid": "bot@xmpp.zoom.us",
  "to_jid": "channel@conference.xmpp.zoom.us",
  "user_jid": "user@xmpp.zoom.us",
  "is_markdown_support": true,
  "content": {
    "head": {"text": "Title"},
    "body": [
      {
        "type": "message",
        "text": "**Bold** _italic_"
      }
    ]
  }
}
```

**Key Differences:**
- ✅ `user_jid` is REQUIRED in Zoom
- ✅ `is_markdown_support: true` for markdown
- ✅ `content.body` array (not `blocks`)

---

## Interactive Buttons

### Slack
```json
{
  "type": "button",
  "text": {"type": "plain_text", "text": "Click"},
  "value": "button_1",
  "style": "primary"
}
```

### Zoom
```json
{
  "action_id": "button_1",
  "text": "Click",
  "value": "{\"action\":\"click\"}",
  "style": "Primary"
}
```

**Key Differences:**
- ✅ `style` is **capitalized**: `'Primary'`, `'Danger'`, `'Default'`
- ✅ `value` should be JSON string
- ✅ `action_id` instead of `action_id` in response

---

## Events & Webhooks

| Event | Slack | Zoom |
|-------|-------|------|
| **Slash Command** | Direct webhook | `bot_notification` |
| **Button Click** | `block_actions` | `interactive_message_actions` |
| **Message Posted** | `message` event | ❌ No passive listening |
| **App Installed** | `app_installed` | `bot_installed` |
| **URL Validation** | Challenge-response | `endpoint.url_validation` |

---

## OAuth Tokens

### Slack
```javascript
// User token
const token = await client.auth.test();
```

### Zoom
```javascript
// Bot token (client_credentials)
const token = await axios.post(
  'https://zoom.us/oauth/token?grant_type=client_credentials',
  {},
  {
    headers: {
      Authorization: `Basic ${base64(clientId:clientSecret)}`
    }
  }
);
```

**Key Differences:**
- ✅ Use `client_credentials` not `account_credentials`
- ✅ Tokens expire (cache with TTL)
- ✅ Base64 encode `clientId:clientSecret`

---

## Common Bugs (CRITICAL)

### Bug #1: Missing `user_jid`
```typescript
// ❌ WRONG (API error 7001)
{
  to_jid: channelId,
  is_markdown_support: true,
  content: {...}
}

// ✅ CORRECT
{
  to_jid: channelId,
  user_jid: userJid,  // Required!
  is_markdown_support: true,
  content: {...}
}
```

### Bug #2: Lowercase Button Styles
```typescript
// ❌ WRONG (API error 7001)
style: 'primary'

// ✅ CORRECT
style: 'Primary'
```

### Bug #3: Duplicate Body Field
```typescript
// ❌ WRONG
{
  ...messagePayload,  // Includes 'body'
  content: {
    body: [...]  // Duplicate!
  }
}

// ✅ CORRECT
{
  to_jid: messagePayload.to_jid,
  user_jid: messagePayload.user_jid,
  content: {
    body: [...]  // Only one body
  }
}
```

---

## Markdown Support

| Feature | Slack | Zoom |
|---------|-------|------|
| **Bold** | `*bold*` | `**bold**` |
| **Italic** | `_italic_` | `_italic_` |
| **Code** | `` `code` `` | `` `code` `` |
| **Link** | `<url\|text>` | `[text](url)` |
| **Heading** | ❌ | `# Heading` |
| **List** | ❌ | `- Item` |
| **Emoji** | `:smile:` | `:smile:` |

---

## Environment Detection

```typescript
// Auto-detect dev vs production
const isProduction = botJid.endsWith('@xmpp.zoom.us');
const apiHost = isProduction
  ? 'https://api.zoom.us'
  : 'https://zoomdev.us';
```

---

## Webhook Pattern

### ❌ WRONG (causes "headers already sent")
```typescript
if (body.event === 'bot_notification') {
  await handleCommand(payload);  // Zoom waits too long
  res.json({ success: true });
}
```

### ✅ CORRECT (fire-and-forget)
```typescript
if (body.event === 'bot_notification') {
  res.json({ success: true });  // Respond immediately

  handleCommand(payload).catch(error => {
    console.error('Failed:', error);
  });
}
```

---

## Feature Parity Guide

| App Type | Expected Parity | Manual Work |
|----------|----------------|-------------|
| Command-driven (buttons) | 85-90% | 0-2 fixes |
| Standard bot (messages) | 70-85% | 2-5 fixes |
| Modal-heavy | 40-70% | 5-10 fixes |
| Passive listening | <40% | Major rewrite |

---

## Quick Commands

```bash
# Run skill (includes automatic validation)
/slack-to-zoom-migrate https://github.com/user/slack-bot

# Test bot locally
cd ~/generated-bot
npm install
npm run dev

# Test slash command
curl -X POST http://localhost:3000/webhooks/zoom \
  -d '{"event":"bot_notification","payload":{...}}'
```

---

## Resources

- **API Mapping:** [docs/API_MAPPING_REFERENCE.md](../docs/API_MAPPING_REFERENCE.md)
- **Common Bugs:** [COMMON_BUGS.md](COMMON_BUGS.md)
- **Code Examples:** [docs/code-examples/](../docs/code-examples/)
- **Zoom API Docs:** [docs/ZOOM_OFFICIAL_DOCS.md](../docs/ZOOM_OFFICIAL_DOCS.md)
