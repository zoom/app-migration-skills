# Slack API Documentation Directory

Complete reference of all Slack API documentation links organized by category.

**Last Updated:** 2026-02-18

---

## Core Documentation

- [Slack API Home](https://api.slack.com/) - Main API documentation hub
- [Slack Developer Docs](https://api.slack.com/docs) - Getting started with Slack development
- [API Methods Overview](https://api.slack.com/methods) - All available API methods
- [Quick Start Guide](https://api.slack.com/start) - Build your first Slack app

---

## Messaging APIs

### Sending Messages
- [chat.postMessage](https://api.slack.com/methods/chat.postMessage) - Send a message to a channel
- [chat.postEphemeral](https://api.slack.com/methods/chat.postEphemeral) - Send ephemeral message (visible to one user)
- [chat.scheduleMessage](https://api.slack.com/methods/chat.scheduleMessage) - Schedule a message for later

### Managing Messages
- [chat.update](https://api.slack.com/methods/chat.update) - Update an existing message
- [chat.delete](https://api.slack.com/methods/chat.delete) - Delete a message
- [chat.getPermalink](https://api.slack.com/methods/chat.getPermalink) - Get permalink to a message
- [chat.unfurl](https://api.slack.com/methods/chat.unfurl) - Provide custom unfurls for links

### Message Formatting
- [Message Formatting](https://api.slack.com/reference/surfaces/formatting) - Text formatting guide
- [Composing Messages](https://api.slack.com/messaging/composing) - Message composition best practices
- [Message Attachments (Legacy)](https://api.slack.com/reference/messaging/attachments) - Legacy attachment format

---

## Block Kit (UI Framework)

### Core Block Kit
- [Block Kit Overview](https://api.slack.com/block-kit) - Introduction to Block Kit
- [Block Kit Builder](https://app.slack.com/block-kit-builder) - Visual Block Kit editor
- [Block Kit Reference](https://api.slack.com/reference/block-kit/blocks) - All available blocks
- [Block Kit Best Practices](https://api.slack.com/block-kit/building) - Design guidelines

### Block Types
- [Section Block](https://api.slack.com/reference/block-kit/blocks#section) - Text with optional accessory
- [Actions Block](https://api.slack.com/reference/block-kit/blocks#actions) - Interactive elements container
- [Context Block](https://api.slack.com/reference/block-kit/blocks#context) - Contextual information
- [Divider Block](https://api.slack.com/reference/block-kit/blocks#divider) - Visual separator
- [Image Block](https://api.slack.com/reference/block-kit/blocks#image) - Display images
- [Input Block](https://api.slack.com/reference/block-kit/blocks#input) - Form input fields
- [Header Block](https://api.slack.com/reference/block-kit/blocks#header) - Plain text heading

### Block Elements
- [Button Element](https://api.slack.com/reference/block-kit/block-elements#button) - Clickable buttons
- [Select Menus](https://api.slack.com/reference/block-kit/block-elements#select) - Dropdown selections
- [Multi-select Menus](https://api.slack.com/reference/block-kit/block-elements#multi_select) - Multiple selections
- [Overflow Menu](https://api.slack.com/reference/block-kit/block-elements#overflow) - Overflow menu
- [Date Picker](https://api.slack.com/reference/block-kit/block-elements#datepicker) - Date selection
- [Time Picker](https://api.slack.com/reference/block-kit/block-elements#timepicker) - Time selection
- [Plain Text Input](https://api.slack.com/reference/block-kit/block-elements#input) - Text input field
- [Checkboxes](https://api.slack.com/reference/block-kit/block-elements#checkboxes) - Checkbox groups
- [Radio Buttons](https://api.slack.com/reference/block-kit/block-elements#radio) - Radio button groups

---

## Interactivity

### Core Interactivity
- [Interactivity Overview](https://api.slack.com/interactivity) - Understanding interactive components
- [Handling Interactions](https://api.slack.com/interactivity/handling) - Processing user interactions
- [Action Payloads](https://api.slack.com/reference/interaction-payloads) - Understanding payload structure

### Modals (Views)
- [Modals Overview](https://api.slack.com/surfaces/modals) - Working with modals
- [views.open](https://api.slack.com/methods/views.open) - Open a modal view
- [views.update](https://api.slack.com/methods/views.update) - Update an existing view
- [views.push](https://api.slack.com/methods/views.push) - Push a new view onto the stack
- [Modal Submission](https://api.slack.com/surfaces/modals/using#handling_submissions) - Handle modal form submissions

### Shortcuts
- [Shortcuts Overview](https://api.slack.com/interactivity/shortcuts) - Global and message shortcuts
- [Message Shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) - Context menu actions
- [Global Shortcuts](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) - Quick actions from anywhere

---

## Events API

### Core Events
- [Events API Overview](https://api.slack.com/events-api) - Understanding event subscriptions
- [Event Types Reference](https://api.slack.com/events) - All available event types
- [Event Subscriptions](https://api.slack.com/apis/connections/events-api) - Subscribing to events

### Common Events
- [message Event](https://api.slack.com/events/message) - Message posted in channel
- [app_mention Event](https://api.slack.com/events/app_mention) - App mentioned in message
- [reaction_added Event](https://api.slack.com/events/reaction_added) - Reaction added to message
- [member_joined_channel Event](https://api.slack.com/events/member_joined_channel) - User joins channel
- [message.channels Event](https://api.slack.com/events/message.channels) - Public channel message
- [message.groups Event](https://api.slack.com/events/message.groups) - Private channel message
- [message.im Event](https://api.slack.com/events/message.im) - Direct message

### Event Verification
- [URL Verification](https://api.slack.com/events-api#url_verification) - Verifying event endpoint
- [Request Verification](https://api.slack.com/authentication/verifying-requests-from-slack) - Validating requests from Slack

---

## Slash Commands

- [Slash Commands Guide](https://api.slack.com/interactivity/slash-commands) - Complete slash commands guide
- [Creating Slash Commands](https://api.slack.com/interactivity/slash-commands#creating_commands) - How to create commands
- [Responding to Commands](https://api.slack.com/interactivity/slash-commands#responding_to_commands) - Command response patterns
- [Command Parameters](https://api.slack.com/interactivity/slash-commands#app_command_handling) - Understanding command payload
- [Delayed Responses](https://api.slack.com/interactivity/slash-commands#delayed_responses_and_multiple_responses) - Responding after 3 seconds

---

## OAuth & Authentication

### OAuth
- [OAuth Overview](https://api.slack.com/authentication/oauth-v2) - OAuth 2.0 implementation
- [Installing with OAuth](https://api.slack.com/authentication/oauth-v2#installing) - OAuth installation flow
- [Token Types](https://api.slack.com/authentication/token-types) - Bot vs user tokens
- [OAuth Scopes](https://api.slack.com/scopes) - Available permission scopes
- [Rotating Tokens](https://api.slack.com/authentication/rotation) - Token refresh and rotation

### Token Management
- [oauth.v2.access](https://api.slack.com/methods/oauth.v2.access) - Exchange code for tokens
- [auth.test](https://api.slack.com/methods/auth.test) - Test authentication token

---

## App Home & Surfaces

- [App Home](https://api.slack.com/surfaces/app-home) - Building your app's home tab
- [App Home Events](https://api.slack.com/events/app_home_opened) - Home tab opened event
- [Messages Tab](https://api.slack.com/surfaces/app-home#messages-tab) - Direct messages in App Home

---

## User & Channel APIs

### Users
- [users.info](https://api.slack.com/methods/users.info) - Get user information
- [users.list](https://api.slack.com/methods/users.list) - List workspace users
- [users.lookupByEmail](https://api.slack.com/methods/users.lookupByEmail) - Find user by email
- [users.profile.get](https://api.slack.com/methods/users.profile.get) - Get user profile

### Channels/Conversations
- [conversations.info](https://api.slack.com/methods/conversations.info) - Get channel info
- [conversations.list](https://api.slack.com/methods/conversations.list) - List channels
- [conversations.members](https://api.slack.com/methods/conversations.members) - List channel members
- [conversations.history](https://api.slack.com/methods/conversations.history) - Get channel message history
- [conversations.create](https://api.slack.com/methods/conversations.create) - Create a channel
- [conversations.join](https://api.slack.com/methods/conversations.join) - Join a channel

---

## File Handling

- [files.upload](https://api.slack.com/methods/files.upload) - Upload a file
- [files.uploadV2](https://api.slack.com/methods/files.uploadV2) - Upload file (new method)
- [files.info](https://api.slack.com/methods/files.info) - Get file information
- [files.delete](https://api.slack.com/methods/files.delete) - Delete a file
- [files.list](https://api.slack.com/methods/files.list) - List files

---

## App Configuration

- [App Manifest](https://api.slack.com/reference/manifests) - Define app configuration
- [Bot Users](https://api.slack.com/bot-users) - Bot user documentation
- [App Distribution](https://api.slack.com/start/distributing) - Distributing your app

---

## Rate Limits & Best Practices

- [Rate Limits](https://api.slack.com/docs/rate-limits) - API rate limiting
- [Best Practices](https://api.slack.com/best-practices) - Development best practices
- [Error Handling](https://api.slack.com/docs/error-handling) - Handling API errors

---

## Tools & Resources

- [Slack CLI](https://api.slack.com/automation/cli) - Command-line interface
- [SDKs](https://api.slack.com/tools) - Official SDKs (Node, Python, Java, etc.)
- [Bolt Framework](https://api.slack.com/tools/bolt) - Official app framework
- [API Tester](https://api.slack.com/methods) - Test API methods in browser

---

## Support

- [Developer Portal](https://api.slack.com/apps) - Manage your apps
- [Community Forum](https://community.slack.com/) - Developer community
- [Support](https://api.slack.com/support) - Get help

---

## API Endpoints Quick Reference

### Messaging
```
POST   chat.postMessage        - Send message
POST   chat.update             - Update message
POST   chat.delete             - Delete message
POST   chat.scheduleMessage    - Schedule message
GET    chat.getPermalink       - Get message link
```

### Views/Modals
```
POST   views.open              - Open modal
POST   views.update            - Update modal
POST   views.push              - Push view
```

### Users & Channels
```
GET    users.info              - Get user info
GET    users.list              - List users
GET    conversations.info      - Get channel info
GET    conversations.list      - List channels
GET    conversations.history   - Get messages
```

### Files
```
POST   files.upload            - Upload file
GET    files.info              - Get file info
POST   files.delete            - Delete file
```

### OAuth
```
POST   oauth.v2.access         - Get access token
GET    auth.test               - Test token
```

---

## Key Features Comparison with Zoom

### What Slack Has (Zoom Doesn't)
- ✅ Passive message listening (all channel messages)
- ✅ Rich Block Kit (20+ elements)
- ✅ True modal dialogs
- ✅ App Home
- ✅ Message shortcuts
- ✅ Comprehensive file APIs
- ✅ User/channel listing APIs

### What Both Have
- ✅ Slash commands
- ✅ Interactive buttons
- ✅ Message sending/updating/deleting
- ✅ OAuth authentication
- ✅ Webhook events

---

## Related Documentation

- [Zoom API Documentation Directory](ZOOM_OFFICIAL_DOCS.md) - Corresponding Zoom APIs
- [API Mapping Reference](API_MAPPING_REFERENCE.md) - Complete Slack-to-Zoom mappings
- [Code Examples](code-examples/) - Working code samples

---

**Total Links:** 70+

**Most Important for Migration:**
1. [chat.postMessage](https://api.slack.com/methods/chat.postMessage)
2. [Block Kit Reference](https://api.slack.com/reference/block-kit/blocks)
3. [Interactivity Handling](https://api.slack.com/interactivity/handling)
4. [Events API](https://api.slack.com/events-api)
5. [OAuth Guide](https://api.slack.com/authentication/oauth-v2)
