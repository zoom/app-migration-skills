# Slack-to-Zoom API Mapping Reference

**Comprehensive guide for migrating Slack apps to Zoom Team Chat**

**Version:** 1.0
**Last Updated:** 2026-02-18
**Status:** Production Ready

---

## Table of Contents

1. [Quick Reference Matrix](#quick-reference-matrix)
2. [Messaging APIs](#1-messaging-apis)
3. [Events & Webhooks](#2-events--webhooks)
4. [Interactive Components](#3-interactive-components)
5. [Message Formatting](#4-message-formatting)
6. [OAuth & Authentication](#5-oauth--authentication)
7. [Slash Commands](#6-slash-commands)
8. [Webhook Security](#7-webhook-security)
9. [User & Channel Resolution](#8-user--channel-resolution)
10. [File Handling](#9-file-handling)
11. [Rate Limiting](#10-rate-limiting)
12. [Migration Patterns](#migration-patterns)
13. [Known Limitations](#known-limitations)

---

## Supplementary Documentation

This guide covers API-level mappings. For detailed implementation guidance, see:

- **[ASYNC_OPERATIONS.md](./ASYNC_OPERATIONS.md)** - Message ID tracking, state management, async lookups (CRITICAL)
- **[OMITTED_FIELDS.md](./OMITTED_FIELDS.md)** - Complete list of 51+ fields unavailable in Zoom APIs
- **[EMOJI_REFERENCE.md](./EMOJI_REFERENCE.md)** - Emoji handling and conversion (optional)

**Quick links:**
- Need to track message IDs for updates/deletes? → See [ASYNC_OPERATIONS.md](./ASYNC_OPERATIONS.md)
- Wondering why user.is_admin doesn't exist? → See [OMITTED_FIELDS.md](./OMITTED_FIELDS.md)
- Building emoji picker or custom reactions? → See [EMOJI_REFERENCE.md](./EMOJI_REFERENCE.md)

---

## Quick Reference Matrix

| Slack Feature | Zoom Equivalent | Compatibility | Priority |
|---------------|-----------------|---------------|----------|
| Slash commands | bot_notification event | 100% ✅ | CRITICAL |
| Interactive buttons | interactive_message_actions | 100% ✅ | CRITICAL |
| Message sending | POST /im/chat/messages | 90% ✅ | CRITICAL |
| Message updates | PUT /im/chat/messages/{id} | 90% ✅ | HIGH |
| Block Kit | Markdown + message cards | 70% ⚠️ | CRITICAL |
| OAuth | Client credentials flow | 100% ✅ | CRITICAL |
| Webhooks | HMAC SHA256 validation | 100% ✅ | CRITICAL |
| Message deletion | DELETE /im/chat/messages/{id} | 100% ✅ | HIGH |
| Modals | Inline message cards | 30% ⚠️ | MEDIUM |
| App Home | Not available | 0% ❌ | LOW |
| Passive listening | Only @mentions | 0% ❌ | CRITICAL |
| File upload | Very limited | 20% ⚠️ | LOW |
| User/channel list | Not available | 0% ❌ | MEDIUM |

---

## 1. Messaging APIs

### 1.1 Sending Messages

#### Slack: chat.postMessage

**Documentation:** [chat.postMessage](https://api.slack.com/methods/chat.postMessage)

**Method:** `POST`
**Endpoint:** `https://slack.com/api/chat.postMessage`

**Key Parameters:**
```typescript
{
  channel: string,      // Channel ID (e.g., "C123456")
  text: string,         // Message text (fallback)
  blocks?: Block[],     // Block Kit blocks
  thread_ts?: string,   // Thread timestamp
  mrkdwn?: boolean      // Enable markdown (default: true)
}
```

#### Zoom: Send Chat Message

**Documentation:** [sendChatMessage](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/sendChatMessage)

**Method:** `POST`
**Endpoint:** `https://api.zoom.us/v2/im/chat/messages`

**Key Parameters:**
```typescript
{
  robot_jid: string,              // Bot JID
  to_jid: string,                 // Channel/user JID
  account_id: string,             // Account ID
  user_jid: string,               // User JID (who triggered)
  is_markdown_support: boolean,   // REQUIRED: true
  content: {
    head: { text: string },       // Message title
    body: MessageBody[]           // Message content array
  }
}
```

#### Parameter Mapping

| Slack Parameter | Zoom Equivalent | Notes |
|----------------|-----------------|-------|
| `channel` | `to_jid` | Format: "C123" → "channel@company.zoom.us" |
| `text` | `content.body[].text` | Plain text or markdown |
| `blocks` | `content.body` | Requires conversion to Zoom format |
| `thread_ts` | Not supported | No threading in Zoom |
| N/A | `robot_jid` | Required: Bot identity |
| N/A | `account_id` | Required: From webhook payload |
| N/A | `user_jid` | Required: From webhook payload |
| N/A | `is_markdown_support` | Required: Must be `true` |

#### Compatibility: 90% ✅

**Works:**
- ✅ Basic text messages
- ✅ Markdown formatting
- ✅ Interactive buttons
- ✅ Message cards

**Doesn't Work:**
- ❌ Threading
- ❌ Complex Block Kit layouts
- ❌ CSS-style properties
- ❌ Rich text elements

**Code Example:** See [send-message.md](code-examples/send-message.md)

---

### 1.2 Updating Messages

#### Slack: chat.update

**Documentation:** [chat.update](https://api.slack.com/methods/chat.update)

**Key Parameters:**
```typescript
{
  channel: string,
  ts: string,          // Message timestamp (ID)
  text: string,
  blocks?: Block[]
}
```

#### Zoom: Update Message

**Documentation:** [updateMessage](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/updateMessage)

**Method:** `PUT`
**Endpoint:** `https://api.zoom.us/v2/im/chat/messages/{messageId}`

**Key Parameters:**
```typescript
{
  to_jid: string,
  user_jid: string,
  account_id: string,
  is_markdown_support: boolean,
  content: {
    head: { text: string },
    body: MessageBody[]
  }
}
```

#### Parameter Mapping

| Slack Parameter | Zoom Equivalent | Notes |
|----------------|-----------------|-------|
| `channel` | `to_jid` | Channel JID |
| `ts` | `{messageId}` in URL | Must track message ID from send response |
| `text` | `content.body[].text` | Updated content |
| `blocks` | `content.body` | Converted format |

#### Compatibility: 90% ✅

**Important:** You must track message IDs from the send response to update messages later.

**Code Example:** See [update-message.md](code-examples/update-message.md)

---

### 1.3 Deleting Messages

#### Slack: chat.delete

**Documentation:** [chat.delete](https://api.slack.com/methods/chat.delete)

#### Zoom: Delete Message

**Documentation:** [deleteMessage](https://developers.zoom.us/docs/api/rest/reference/chat/methods/#operation/deleteMessage)

**Method:** `DELETE`
**Endpoint:** `https://api.zoom.us/v2/im/chat/messages/{messageId}`

#### Compatibility: 100% ✅

Direct equivalent - works identically.

---

## 2. Events & Webhooks

### 2.1 Event Comparison

#### Slack Events API

**Documentation:** [Events API](https://api.slack.com/events-api)

**Architecture:** Event subscriptions with JSON payloads

**Common Events:**
- `message` - Any message posted ([docs](https://api.slack.com/events/message))
- `app_mention` - App mentioned ([docs](https://api.slack.com/events/app_mention))
- `reaction_added` - Reaction added to message
- `member_joined_channel` - User joins channel

**Payload Structure:**
```typescript
{
  type: "event_callback",
  event: {
    type: "message",
    user: "U123",
    text: "Hello",
    channel: "C123",
    ts: "1234567890.123"
  }
}
```

#### Zoom Webhook Events

**Documentation:** [Chatbot Webhooks](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/)

**Architecture:** Webhook-based with limited event types

**Available Events:**
- `bot_notification` - Slash command or @mention ([docs](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/#bot_notification))
- `interactive_message_actions` - Button clicked ([docs](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/#interactive_message_actions))
- `endpoint.url_validation` - Webhook verification ([docs](https://developers.zoom.us/docs/api/webhooks/#validating-your-webhook-endpoint))
- `bot_installed` - App installed
- `app_deauthorized` - App uninstalled

**Payload Structure:**
```typescript
{
  event: "bot_notification",
  payload: {
    cmd: "/command args",
    userJid: "user@company.zoom.us",
    userName: "John Doe",
    toJid: "channel@company.zoom.us",
    accountId: "abc123",
    timestamp: 1234567890000
  }
}
```

### 2.2 Event Mapping Table

| Slack Event | Zoom Event | Compatibility | Notes |
|-------------|------------|---------------|-------|
| Slash command | `bot_notification` | 100% ✅ | Direct equivalent |
| `app_mention` | `bot_notification` (with @) | 80% ✅ | Requires @mention |
| Button/action | `interactive_message_actions` | 90% ✅ | Button clicks work |
| `message` (passive) | Not available | 0% ❌ | **Critical limitation** |
| `url_verification` | `endpoint.url_validation` | 100% ✅ | Different validation method |
| `reaction_added` | Not available | 0% ❌ | No reaction events |
| `member_joined_channel` | Not available | 0% ❌ | No channel events |

### 2.3 Critical Difference: Passive Listening

**Slack:** Can listen to ALL messages in channels where app is installed

**Zoom:** Can ONLY receive:
1. Slash commands (explicit invocation)
2. @mentions of the bot

**Impact:** Apps relying on passive message monitoring (moderation bots, analytics, etc.) cannot be fully migrated.

**Workaround:** Design app to require explicit bot invocation via slash commands or @mentions.

**Code Example:** See [webhook-validation.md](code-examples/webhook-validation.md)

---

## 3. Interactive Components

### 3.1 Buttons

#### Slack Button

**Documentation:** [Button Element](https://api.slack.com/reference/block-kit/block-elements#button)

```typescript
{
  type: "actions",
  elements: [{
    type: "button",
    text: {
      type: "plain_text",
      text: "Click Me"
    },
    action_id: "button_click",
    value: "button_value",
    style: "primary"  // primary, danger
  }]
}
```

#### Zoom Button

**Documentation:** [Interactive Messages](https://developers.zoom.us/docs/team-chat/customizing-messages/)

```typescript
{
  type: "actions",
  items: [{
    text: "Click Me",
    value: JSON.stringify({
      action: "button_click",
      data: "button_value"
    }),
    style: "Default"  // Default, Primary, Danger
  }]
}
```

#### Key Differences

| Aspect | Slack | Zoom |
|--------|-------|------|
| Value format | Simple string | JSON-stringified object |
| Text format | Object with type | Plain string |
| Styles | `primary`, `danger` | `Default`, `Primary`, `Danger` |
| Action ID | Separate `action_id` field | Embedded in `value` JSON |

#### Compatibility: 100% ✅

**Code Example:** See [button-handling.md](code-examples/button-handling.md)

---

### 3.2 Modals vs Inline Cards

#### Slack Modals

**Documentation:** [Modals](https://api.slack.com/surfaces/modals)

**Features:**
- Full-screen dialog overlays
- Multi-step forms
- Complex input validation
- Push/pop navigation

```typescript
await client.views.open({
  trigger_id: "12345",
  view: {
    type: "modal",
    title: { type: "plain_text", text: "My Modal" },
    blocks: [/* complex form */]
  }
});
```

#### Zoom Inline Cards

**Documentation:** [Message Cards](https://developers.zoom.us/docs/team-chat/customizing-messages/)

**Limitations:**
- No true modal support
- Inline message cards only
- Limited form inputs
- No multi-step flows

**Workaround:**
Send sequential messages to simulate multi-step process.

#### Compatibility: 30% ⚠️

**Migration Strategy:**
1. Convert modal to inline message card
2. Break multi-step forms into sequential messages
3. Use buttons for navigation
4. Store state in external database

---

### 3.3 Select Menus, Date Pickers, etc.

#### Slack

**Rich Components:**
- Select menus (static, users, channels, conversations)
- Multi-select menus
- Date pickers, time pickers
- Overflow menus
- Checkboxes, radio buttons

**Documentation:** [Block Kit Elements](https://api.slack.com/reference/block-kit/block-elements)

#### Zoom

**Available:**
- Buttons only

**Not Available:**
- ❌ Select menus
- ❌ Date pickers
- ❌ Checkboxes
- ❌ Radio buttons
- ❌ Text inputs

#### Compatibility: 0% ❌

**Workaround:** Use button-based selection:
```typescript
// Instead of select menu, use multiple buttons
{
  type: "actions",
  items: [
    { text: "Option 1", value: JSON.stringify({ option: 1 }) },
    { text: "Option 2", value: JSON.stringify({ option: 2 }) },
    { text: "Option 3", value: JSON.stringify({ option: 3 }) }
  ]
}
```

---

## 4. Message Formatting

### 4.1 Block Kit vs Markdown

#### Slack Block Kit

**Documentation:** [Block Kit](https://api.slack.com/block-kit)

**Features:**
- 20+ block types
- Rich text elements
- CSS-style properties
- Accessory elements
- Complex layouts

**Example:**
```typescript
blocks: [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Bold* _italic_ ~strike~"
    },
    accessory: {
      type: "image",
      image_url: "https://example.com/image.png",
      alt_text: "image"
    }
  },
  {
    type: "divider"
  }
]
```

#### Zoom Markdown

**Documentation:** [Markdown Support](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/)

**Features:**
- Basic markdown only
- No complex layouts
- No accessory elements
- Simple text styling

**Example:**
```typescript
content: {
  head: { text: "Message Title" },
  body: [
    {
      type: "message",
      text: "**Bold** *italic* ~~strike~~"
    }
  ]
}
```

### 4.2 Markdown Conversion Table

| Slack Format | Zoom Format | Support |
|-------------|-------------|---------|
| `*bold*` | `**bold**` | ✅ |
| `_italic_` | `*italic*` | ✅ |
| `~strike~` | `~~strike~~` | ✅ |
| `<url\|text>` | `[text](url)` | ✅ |
| `` `code` `` | `` `code` `` | ✅ |
| `> quote` | `> quote` | ✅ |
| `• bullet` | `• bullet` | ✅ |
| Emoji `:smile:` | Emoji `:smile:` | ✅ |
| `<@U123>` (mention) | `@username` | ⚠️ Requires lookup |
| `<#C123>` (channel) | `#channel` | ⚠️ Requires lookup |
| Multi-column layout | Not supported | ❌ |
| Image accessories | Not supported | ❌ |
| Context blocks | Not supported | ❌ |

### 4.3 Unsupported Features

**Slack Features with No Zoom Equivalent:**
- ❌ CSS-style properties (`"style": "primary"`, `"color": "#ff0000"`)
- ❌ Multi-column layouts
- ❌ Accessory elements (images next to text)
- ❌ Context blocks
- ❌ Rich text elements (code blocks with syntax highlighting)
- ❌ Dividers
- ❌ Headers
- ❌ Tables

#### Compatibility: 70% ⚠️

**Code Example:** See [markdown-conversion.md](code-examples/markdown-conversion.md)

---

## 5. OAuth & Authentication

### 5.1 OAuth Flow Comparison

#### Slack: Authorization Code Flow

**Documentation:** [OAuth](https://api.slack.com/authentication/oauth-v2)

**Flow:**
1. Redirect user to Slack OAuth page
2. User authorizes app
3. Slack redirects back with `code`
4. Exchange `code` for `access_token` and `refresh_token`
5. Use `refresh_token` to get new `access_token` when expired

**Token Request:**
```typescript
POST https://slack.com/api/oauth.v2.access
{
  client_id: "...",
  client_secret: "...",
  code: "...",
  redirect_uri: "...",
  grant_type: "authorization_code"
}
```

**Response:**
```typescript
{
  access_token: "xoxb-...",
  refresh_token: "xoxe-...",
  expires_in: 43200,
  bot_user_id: "U123"
}
```

#### Zoom: Client Credentials Flow

**Documentation:** [Server-to-Server OAuth](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)

**Flow:**
1. Request token with client credentials
2. Receive short-lived access token
3. Re-authenticate when token expires (no refresh token)

**Token Request:**
```typescript
POST https://zoom.us/oauth/token
Authorization: Basic base64(client_id:client_secret)
{
  grant_type: "client_credentials"
}
```

**Response:**
```typescript
{
  access_token: "eyJ...",
  token_type: "bearer",
  expires_in: 3600
}
```

### 5.2 OAuth Parameter Mapping

| Slack | Zoom | Notes |
|-------|------|-------|
| Authorization Code flow | Client Credentials flow | Different OAuth grant types |
| User consent required | Server-to-server (no user consent) | Zoom bots don't need user auth |
| `access_token` + `refresh_token` | `access_token` only | Zoom: re-authenticate, no refresh |
| Longer token lifetime (12h+) | Shorter lifetime (1h) | More frequent re-auth needed |
| User-level permissions | Bot-level permissions | Zoom bots act as bot identity |

### 5.3 Scope Mapping

#### Slack Scopes

**Documentation:** [OAuth Scopes](https://api.slack.com/scopes)

Common bot scopes:
- `chat:write` - Send messages
- `chat:write.customize` - Customize bot appearance
- `commands` - Add slash commands
- `users:read` - View users
- `channels:read` - View channels

#### Zoom Scopes

**Documentation:** [App Scopes](https://developers.zoom.us/docs/integrations/oauth-scopes/)

**Required scope:**
- `imchat:bot` - All bot functionality

**Key Difference:** Zoom uses single `imchat:bot` scope for all bot operations, while Slack has granular scopes.

#### Compatibility: 100% ✅ (different pattern)

**Code Example:** See [oauth-flow.md](code-examples/oauth-flow.md)

---

## 6. Slash Commands

### 6.1 Command Definition

#### Slack

**Documentation:** [Slash Commands](https://api.slack.com/interactivity/slash-commands)

**Configuration:** Define in app manifest or app settings
**Format:** `/command [args]`
**Delivery:** HTTP POST to specified request URL

#### Zoom

**Documentation:** [Slash Commands](https://developers.zoom.us/docs/team-chat/chatbot/extend/slash-commands-in-Zoom/)

**Configuration:** Define in bot settings (Zoom Marketplace)
**Format:** `/command [args]`
**Delivery:** Webhook event `bot_notification` to bot endpoint

### 6.2 Payload Comparison

#### Slack Payload

```typescript
{
  command: "/vote",
  text: "Should we order pizza?",
  user_id: "U123",
  user_name: "john",
  channel_id: "C123",
  channel_name: "general",
  team_id: "T123",
  trigger_id: "12345.67890"
}
```

#### Zoom Payload

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

### 6.3 Key Differences

| Aspect | Slack | Zoom |
|--------|-------|------|
| Command parsing | `command` + `text` separate | Single `cmd` string to parse |
| User ID | `user_id` (e.g., "U123") | `userJid` (e.g., "user@zoom.us") |
| Channel ID | `channel_id` (e.g., "C123") | `toJid` (e.g., "channel@zoom.us") |
| Trigger ID | Provided (for modals) | Not available |
| Response timeout | 3 seconds | Immediate (fire-and-forget) |
| Multiple commands | Separate endpoint per command | All to same webhook endpoint |

### 6.4 Response Pattern

#### Slack
```typescript
// Must respond within 3 seconds
res.json({
  response_type: "in_channel",
  text: "Your response"
});
```

#### Zoom
```typescript
// Respond immediately (200 OK)
res.json({ success: true });

// Process asynchronously
handleCommand(payload).catch(console.error);
```

#### Compatibility: 100% ✅

**Code Example:** See [slash-commands.md](code-examples/slash-commands.md)

---

## 7. Webhook Security

### 7.1 Slack Request Verification

**Documentation:** [Request Verification](https://api.slack.com/authentication/verifying-requests-from-slack)

**Method:** HMAC SHA256 signature

**Headers:**
- `X-Slack-Signature`: Signature
- `X-Slack-Request-Timestamp`: Timestamp

**Verification:**
```typescript
const message = `v0:${timestamp}:${rawBody}`;
const signature = `v0=${crypto
  .createHmac('sha256', signingSecret)
  .update(message)
  .digest('hex')}`;

if (signature !== slackSignature) {
  throw new Error('Invalid signature');
}
```

### 7.2 Zoom Webhook Validation

**Documentation:** [Webhook Validation](https://developers.zoom.us/docs/api/webhooks/#validating-your-webhook-endpoint)

**Method:** HMAC SHA256 signature

**Headers:**
- `x-zm-signature`: Signature
- `x-zm-request-timestamp`: Timestamp

**Verification:**
```typescript
const message = `v0:${timestamp}:${JSON.stringify(body)}`;
const signature = `v0=${crypto
  .createHmac('sha256', secretToken)
  .update(message)
  .digest('hex')}`;

if (signature !== zoomSignature) {
  throw new Error('Invalid signature');
}
```

### 7.3 Key Differences

| Aspect | Slack | Zoom |
|--------|-------|------|
| Algorithm | HMAC SHA256 | HMAC SHA256 |
| Secret | Signing secret | Bot secret token |
| Message format | `v0:timestamp:rawBody` | `v0:timestamp:JSON.stringify(body)` |
| Header prefix | `X-Slack-` | `x-zm-` |

#### Compatibility: 100% ✅

**Code Example:** See [webhook-validation.md](code-examples/webhook-validation.md)

---

## 8. User & Channel Resolution

### 8.1 Slack APIs

**Documentation:**
- [users.info](https://api.slack.com/methods/users.info)
- [conversations.info](https://api.slack.com/methods/conversations.info)
- [users.list](https://api.slack.com/methods/users.list)
- [conversations.list](https://api.slack.com/methods/conversations.list)

**Capabilities:**
- Get user details by ID
- Get channel details by ID
- List all workspace users
- List all channels
- Search users by email

### 8.2 Zoom APIs

**Limitation:** No public APIs for listing users or channels.

**Available Data:**
- User info in webhook payloads (`userJid`, `userName`)
- Channel info in webhook payloads (`toJid`, `channelName`)

**Workaround:**
- Store user/channel mappings in external database
- Build mapping from webhook events over time

#### Compatibility: 50% ⚠️

---

## 9. File Handling

### 9.1 Slack File APIs

**Documentation:**
- [files.upload](https://api.slack.com/methods/files.upload)
- [files.info](https://api.slack.com/methods/files.info)
- [files.delete](https://api.slack.com/methods/files.delete)
- [files.list](https://api.slack.com/methods/files.list)

**Capabilities:**
- Upload files to channels
- Attach files to messages
- List/manage uploaded files
- Share files with comments

### 9.2 Zoom File APIs

**Documentation:** [File Attachments](https://developers.zoom.us/docs/team-chat/customizing-messages/attachment/)

**Limitations:**
- Very limited file API support
- No programmatic upload API
- Can include file links in messages
- Cannot manage files

**Workaround:**
- Use external file storage (S3, Google Drive)
- Send download links in messages
- Handle file management outside Zoom

#### Compatibility: 20% ⚠️

---

## 10. Rate Limiting

### 10.1 Slack Rate Limits

**Documentation:** [Rate Limits](https://api.slack.com/docs/rate-limits)

**Limits:**
- Tier 1: ~1 request per minute
- Tier 2: ~20 requests per minute
- Tier 3: ~50 requests per minute
- Tier 4: ~100 requests per minute

**Headers:**
- `Retry-After`: Seconds to wait
- Status: `429 Too Many Requests`

### 10.2 Zoom Rate Limits

**Documentation:** [Rate Limits](https://developers.zoom.us/docs/api/rate-limits/)

**Limits:**
- Generally ~10 requests per second
- Higher limits for bot apps

**Response:**
- Status: `429 Too Many Requests`

#### Compatibility: 90% ✅

**Note:** Zoom generally has higher rate limits than Slack.

---

## Migration Patterns

### Pattern 1: Simple Command Bot

**Slack Features:**
- Slash commands
- Simple text responses
- Basic buttons

**Zoom Migration:**
- ✅ Direct migration (95% compatibility)
- Change: OAuth flow (authorization code → client credentials)
- Change: Webhook validation method

**Effort:** Low (1-2 days)

---

### Pattern 2: Interactive Workflow Bot

**Slack Features:**
- Slash commands
- Multi-step modals
- Complex Block Kit UI
- State management

**Zoom Migration:**
- ⚠️ Moderate changes (70% compatibility)
- Change: Modals → Sequential messages
- Change: Block Kit → Markdown
- Keep: State management (external DB)

**Effort:** Medium (3-5 days)

---

### Pattern 3: Monitoring/Analytics Bot

**Slack Features:**
- Passive message listening
- Analytics on all messages
- Automatic moderation

**Zoom Migration:**
- ❌ Not fully possible (30% compatibility)
- Limitation: No passive listening
- Workaround: Require @mentions or commands
- Impact: Changes app UX significantly

**Effort:** High (1-2 weeks) + UX redesign

---

## Known Limitations

### Cannot Migrate

**Platform limitations that cannot be worked around:**

1. **Passive Message Listening** ❌
   - Slack: Listen to all channel messages
   - Zoom: Only @mentions and slash commands
   - Impact: Monitoring, analytics, moderation bots

2. **App Home** ❌
   - Slack: Dedicated app home tab
   - Zoom: No equivalent
   - Impact: Persistent app UI/dashboard

3. **True Modals** ❌
   - Slack: Full-screen modal dialogs
   - Zoom: Inline message cards only
   - Impact: Multi-step forms, complex input

4. **Message Threading** ❌
   - Slack: Nested thread conversations
   - Zoom: No threading support
   - Impact: Organized discussions

5. **Rich Block Kit** ❌
   - Slack: 20+ layout components
   - Zoom: Basic markdown only
   - Impact: Complex UI layouts

### Requires Adaptation

**Features that need workarounds:**

1. **Modals** ⚠️
   - Workaround: Sequential messages
   - Loss: User experience, visual flow

2. **Select Menus** ⚠️
   - Workaround: Multiple buttons
   - Loss: Compact UI, search functionality

3. **User/Channel Lists** ⚠️
   - Workaround: Build local cache from webhooks
   - Loss: Real-time accuracy, discovery

4. **File Uploads** ⚠️
   - Workaround: External storage + links
   - Loss: Integrated experience

### Fully Supported

**Features that migrate cleanly:**

1. **Slash Commands** ✅
2. **Interactive Buttons** ✅
3. **Message Sending/Updating** ✅
4. **OAuth Authentication** ✅ (different flow)
5. **Webhook Events** ✅ (subset)
6. **Basic Markdown** ✅

---

## Additional Resources

### Documentation Directories
- [Zoom Documentation Directory](ZOOM_OFFICIAL_DOCS.md) - All Zoom API links
- [Slack Documentation Directory](SLACK_DOCS_DIRECTORY.md) - All Slack API links

### Code Examples
- [Send Message](code-examples/send-message.md) - Slack vs Zoom message sending
- [Button Handling](code-examples/button-handling.md) - Interactive button clicks
- [OAuth Flow](code-examples/oauth-flow.md) - Authentication comparison
- [Webhook Validation](code-examples/webhook-validation.md) - Security validation
- [Markdown Conversion](code-examples/markdown-conversion.md) - Block Kit → Markdown
- [Slash Commands](code-examples/slash-commands.md) - Command handling
- [Update Message](code-examples/update-message.md) - Editing messages
- [Error Handling](code-examples/error-handling.md) - Error patterns

### Category Guides
- [Messaging API](api-mapping/messaging-api.md) - Detailed messaging API mapping
- [Events & Webhooks](api-mapping/events-webhooks.md) - Event handling comparison
- [Interactivity](api-mapping/interactivity.md) - Interactive components guide
- [OAuth & Auth](api-mapping/oauth-auth.md) - Authentication deep-dive
- [Slash Commands](api-mapping/slash-commands.md) - Command implementation
- [Formatting](api-mapping/formatting.md) - Block Kit to Markdown guide

---

## Quick Decision Tree

**Should you migrate this Slack app to Zoom?**

```
Does the app require passive message listening?
├─ YES → ❌ Not recommended (major UX changes required)
└─ NO  → Continue

Does the app heavily use modals for input?
├─ YES → ⚠️ Possible but requires redesign
└─ NO  → Continue

Does the app use mostly commands + buttons + messages?
├─ YES → ✅ Great fit! (85-95% compatibility)
└─ NO  → Evaluate specific features

Does the app need App Home?
├─ YES → ❌ Not possible
└─ NO  → Continue

Does the app need file management?
├─ YES → ⚠️ Use external storage
└─ NO  → Continue

Does the app use complex Block Kit layouts?
├─ YES → ⚠️ Requires markdown simplification
└─ NO  → ✅ Excellent fit!
```

---

**Version:** 1.0
**Last Updated:** 2026-02-18
**Maintainer:** Slack-to-Zoom Migration Skill

*For questions or contributions, see the skill README.*
