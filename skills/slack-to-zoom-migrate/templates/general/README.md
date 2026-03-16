# Zoom Team Chat Bot

A chatbot for Zoom Team Chat, migrated from Slack.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Zoom credentials:

```bash
cp .env.example .env
```

Get your credentials from [Zoom Marketplace](https://marketplace.zoom.us/).

### 3. Run the Bot

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Testing

This project includes comprehensive tests with two modes:

### Unit & Integration Tests (Mocked - Default)

Fast tests using mocked Zoom APIs. Run these frequently during development:

```bash
# Run all unit and integration tests (mocked)
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Features:**
- ✅ Fast execution (~5 seconds)
- ✅ No credentials required
- ✅ Works offline
- ✅ Mocked Zoom API responses
- ✅ Perfect for CI/CD

**Coverage includes:**
- Configuration loading
- Webhook event handling
- Message formatting
- OAuth token management
- Error handling

### E2E Tests (Live API - Optional)

Real API tests that make actual calls to Zoom servers. Use these to validate against the live Zoom API:

```bash
# Run E2E tests with real Zoom API calls
npm run test:e2e

# Run ALL tests (unit + integration + E2E)
npm run test:all
```

**Requirements:**
1. Real Zoom credentials in `.env` (not test placeholders)
2. `TEST_CHANNEL_JID` configured (dedicated test channel)
3. `TEST_ACCOUNT_ID` configured

**Features:**
- 🔴 Makes REAL Zoom API calls
- 🔴 Sends actual messages to your test channel
- ✅ Validates OAuth token generation
- ✅ Tests message sending/updating
- ✅ Confirms API compatibility
- ⚠️ Slower execution (~30-60 seconds)
- ⚠️ Requires network connection

**Setup for E2E tests:**

1. Add test credentials to `.env`:
   ```bash
   # Get your channel JID from Zoom
   TEST_CHANNEL_JID=channel_abc123@conference.xmpp.zoom.us

   # Get your account ID from marketplace.zoom.us
   TEST_ACCOUNT_ID=your_account_id_here
   ```

2. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

**WARNING:** E2E tests send real messages to your Zoom channel. Use a dedicated test channel to avoid spam.

### Test Results

After running tests, you'll see:
- ✅ Number of tests passed
- ⏱️ Execution time
- 📊 Code coverage (for unit/integration tests)
- 🔴 Live API confirmation (for E2E tests)

## Project Structure

```
src/
├── server.ts              # Express server
├── config.ts              # Environment configuration
├── types/                 # TypeScript interfaces
│   └── index.ts
└── zoom/                  # Zoom integration
    ├── auth.ts           # OAuth callback
    ├── tokens.ts         # Token management
    ├── webhook.ts        # Webhook processor
    └── messaging.ts      # Message sending
```

## Customization

### Add Slash Command Logic

Edit `src/zoom/webhook.ts` → `handleSlashCommand()`:

```typescript
async function handleSlashCommand(params) {
  // Add your command logic here
}
```

### Add Button Actions

Edit `src/zoom/webhook.ts` → `handleButtonAction()`:

```typescript
async function handleButtonAction(params) {
  const action = JSON.parse(params.actionValue);
  // Handle different button actions
}
```

### Send Messages

Use the messaging functions in `src/zoom/messaging.ts`:

```typescript
import { sendMessage } from './zoom/messaging';

await sendMessage(userJid, 'Hello!', accountId);
```

## Deployment

Deploy to any Node.js hosting platform (Heroku, Railway, Render, etc.) with these environment variables set.

## License

MIT
