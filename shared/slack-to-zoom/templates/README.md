# Templates

Code templates for Zoom Team Chat app generation.

---

## Overview

Templates provide the foundation for migrated Zoom chatbots. The skill:
1. Copies template files
2. Generates business logic based on Slack app analysis
3. Wires generated code into template structure

---

## Available Templates

### general/
Universal template for all Slack app migrations.

**Includes:**
- **Server infrastructure** - Express server with routes
- **OAuth flow** - Server-to-Server authentication
- **Token management** - Bot token caching with TTL
- **Webhook handling** - bot_notification, interactive_message_actions
- **Message sending** - Markdown-supported messages
- **Type definitions** - TypeScript interfaces
- **Testing framework** - Jest unit/integration/e2e tests

**Structure:**
```
general/
├── src/
│   ├── server.ts           # Express server
│   ├── config.ts           # Environment configuration
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   └── zoom/
│       ├── auth.ts         # OAuth callback handler
│       ├── tokens.ts       # Bot token management
│       ├── webhook.ts      # Webhook event handlers
│       └── messaging.ts    # Message sending functions
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/                # End-to-end tests
│   └── helpers/            # Test helpers
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── jest.config.js          # Jest config
├── .env.example            # Environment variables template
└── README.md               # Generated app README
```

---

## How Templates Are Used

### 1. Foundation (From Template)
```
✅ Server setup (server.ts, config.ts)
✅ OAuth flow (auth.ts, tokens.ts)
✅ Webhook handlers (webhook.ts)
✅ Message sending (messaging.ts)
✅ Type definitions (types/index.ts)
✅ Testing framework (tests/)
```

### 2. Generated (Dynamic)
```
🆕 Business logic (app/*Controller.ts)
🆕 State management (app/*Storage.ts)
🆕 Message builders (app/MessageBuilder.ts)
🆕 Optional integrations (app/*Service.ts)
```

### 3. Wiring (Automatic)
```
🔗 Route handlers in webhook.ts
🔗 Type imports in types/index.ts
🔗 Controller initialization in server.ts
```

---

## Template Files Explained

### server.ts
Express server with routes for:
- Health check (`GET /`)
- OAuth callback (`GET /api/zoomapp/auth`)
- Webhooks (`POST /webhooks/zoom`)
- Optional integrations (`POST /webhooks/github`)

**Auto-detects environment:**
- Production: Bot JID ends with `@xmpp.zoom.us`
- Development: Bot JID ends with `@xmppdev.zoom.us`

### config.ts
Environment variable configuration with validation.

**Required variables:**
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `ZOOM_BOT_JID`
- `ZOOM_WEBHOOK_SECRET_TOKEN`
- `ZOOM_REDIRECT_URI`

**Auto-configured:**
- `ZOOM_API_HOST` (based on Bot JID)
- `ZOOM_OAUTH_HOST` (based on Bot JID)

### zoom/tokens.ts
Bot token management with caching.

**Features:**
- Client credentials OAuth flow
- Token caching with TTL
- Automatic refresh before expiry
- Error handling and retry logic

### zoom/webhook.ts
Webhook event handlers.

**Handles:**
- `endpoint.url_validation` - Webhook URL validation
- `bot_notification` - Slash commands
- `interactive_message_actions` - Button clicks
- `bot_installed` - App installation
- `app_deauthorized` - App uninstall

**Pattern:** Fire-and-forget (respond immediately, process async)

### zoom/messaging.ts
Message sending functions with overloads.

**Functions:**
- `sendMessage(toJid, text)` - Simple text message
- `sendMessage(messagePayload)` - Complex message with buttons
- `updateMessage(messageId, toJid, text)` - Update existing message
- `deleteMessage(messageId)` - Delete message

**Critical Fields:**
- ✅ `user_jid` - Required by Zoom API
- ✅ `is_markdown_support: true` - Enable markdown
- ✅ `content.body` - Message content (not top-level `body`)

### zoom/auth.ts
OAuth callback handler for app installation.

**Flow:**
1. User installs app in Zoom
2. Zoom redirects to callback URL
3. Handler validates and stores credentials
4. Returns success page

---

## Template Customization

### When to Modify Templates

**✅ Safe to modify:**
- Add new routes to `server.ts`
- Add helper functions to `messaging.ts`
- Add new environment variables to `config.ts`
- Extend type definitions in `types/index.ts`

**❌ Avoid modifying:**
- Core OAuth flow (tokens.ts, auth.ts)
- Webhook validation logic
- Fire-and-forget pattern
- Critical field requirements (user_jid, etc.)

### Adding a New Template

1. Create directory: `templates/my-template/`
2. Copy `general/` structure
3. Customize for specific use case
4. Update skill to detect when to use it

---

## Template Validation

Templates are validated during skill development:

**Checks:**
- ✅ All files compile without errors
- ✅ Tests pass
- ✅ Server starts successfully
- ✅ Webhooks respond correctly
- ✅ Messages have required fields
- ✅ OAuth flow works

**Run validation:**
```bash
cd templates/general
npm install
npm test
npm run dev
```

---

## Template Updates

When updating templates:

1. **Test thoroughly** - Validate all features work
2. **Update version** - Bump version in package.json
3. **Document changes** - Update CHANGELOG.md
4. **Regenerate test apps** - Ensure migrations still work
5. **Update validation** - Add checks for new requirements

---

## Known Issues

### Issue: Missing user_jid
**Template:** general/src/zoom/messaging.ts
**Impact:** Messages fail with API error 7001
**Fix:** Ensure all message functions include user_jid

### Issue: Lowercase button styles
**Template:** Generated code (not in template)
**Impact:** Interactive messages fail
**Fix:** Validation catches and auto-fixes

### Issue: Duplicate body field
**Template:** general/src/zoom/messaging.ts (if spread used)
**Impact:** Messages fail with API error 7001
**Fix:** Use explicit field mapping instead of spread

---

## Examples

See `examples/` for real migrations using this template:
- `examples/poker-planner/` - Complex app (voting, sessions)
- `examples/simple-bot/` - Basic app (commands, messages)

---

## Resources

- **Generated App README:** See `general/README.md` for template structure
- **Migration Guide Template:** See `MIGRATION_GUIDE_TEMPLATE.md`
- **API Mapping:** See `../docs/API_MAPPING_REFERENCE.md`
