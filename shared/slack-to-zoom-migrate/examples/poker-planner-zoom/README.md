# 🃏 Planning Poker for Zoom Team Chat

A full-featured planning poker (scrum poker) chatbot for Zoom Team Chat, migrated from the popular [Slack Poker Planner](https://github.com/dgurkaynak/slack-poker-planner).

## ✨ Features

- 🎯 **Interactive Voting**: Cast votes using interactive buttons
- 📊 **Results Display**: See vote distribution and average
- 🔒 **Session Management**: Create, reveal, cancel, and restart sessions
- 🎲 **Custom Points**: Use default Fibonacci points or define your own
- 👥 **Multi-user Support**: Track votes from multiple participants
- 🔄 **Auto-update**: Messages update in real-time as votes come in
- 🚀 **Fast & Responsive**: Built with TypeScript and Express

## Prerequisites

- Node.js 18+ and npm
- Zoom Team Chat account with chatbot creation permissions
- **Public HTTPS URL** for webhooks (ngrok or frp)
  - Required for Zoom to send events to your bot
  - See [za-plans README](https://git.zoom.us/zoom-apps/devs/za-plans#step-3-set-up-public-url-required-for-local-testing) for setup instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Zoom App

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/) → **Develop** → **Build App**
2. Choose **Team Chat App**
3. Fill in basic information
4. **Features** → Enable **Chatbot**
5. Add bot command: `/pp`
6. Save your credentials:
   - Client ID
   - Client Secret
   - Bot JID (format: `username@xmpp.zoom.us`)
   - Webhook Secret Token

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your Zoom credentials
```

**Required environment variables:**
- `ZOOM_CLIENT_ID` - From Zoom Marketplace
- `ZOOM_CLIENT_SECRET` - From Zoom Marketplace
- `ZOOM_BOT_JID` - Bot JID from Chatbot settings
- `ZOOM_WEBHOOK_SECRET_TOKEN` - Webhook secret from Chatbot settings

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

### 5. Expose Local Server (Development)

For local testing, you need a public HTTPS URL so Zoom can reach your webhook endpoint.

**Quick setup:**
```bash
# Option A: ngrok
ngrok http 3000

# Option B: frp (if configured)
frpc -c frpc.ini
```

Copy your public HTTPS URL (e.g., `https://abc123.ngrok.io`) and update:
1. **Zoom Marketplace** → Bot Endpoint URL: `https://your-url/webhooks/zoom`
2. **`.env`** → `ZOOM_REDIRECT_URI=https://your-url/api/zoomapp/auth`

📚 **Need help?** See detailed setup instructions in [za-plans README](https://git.zoom.us/zoom-apps/devs/za-plans#step-3-set-up-public-url-required-for-local-testing)

### 6. Test in Zoom

Add the bot to a Zoom Team Chat channel and run:
```
/pp Test session
```

## Usage

### Start a Planning Session

```bash
# Basic session
/pp User authentication feature

# With custom point values
/pp API refactoring points:XS,S,M,L,XL

# Default points: 0, 1, 2, 3, 5, 8, 13, 21, ?
```

### Voting

1. Click on a point button to cast your vote
2. Votes are recorded and the message updates automatically
3. Click the **👁 Reveal** button to show all votes
4. Click **🔄 Restart** to start a new session with the same settings

### Get Help

```bash
/pp help
```

## Architecture

```
poker-planner-zoom/
├── src/
│   ├── app/           # Application logic
│   │   └── storage.ts # Session storage
│   ├── lib/           # Utility functions
│   │   └── utils.ts   # Helper functions
│   ├── zoom/          # Zoom integration
│   │   ├── auth.ts    # OAuth flow
│   │   ├── tokens.ts  # Token management
│   │   ├── webhook.ts # Webhook handlers
│   │   └── messaging.ts # Message builders
│   ├── types/         # TypeScript types
│   ├── config.ts      # Configuration
│   └── server.ts      # Express server
├── tests/             # Test suite
├── .env.example       # Environment template
└── package.json       # Dependencies
```

## API Endpoints

- `GET /` - Health check
- `POST /webhooks/zoom` - Zoom webhook endpoint
- `GET /api/zoomapp/auth` - OAuth callback

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Build for production
npm run build
```

## Testing

```bash
# Run unit tests (fast, mocked)
npm test

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch

# Run E2E tests (requires real Zoom credentials)
npm run test:e2e
```

## Deployment

### Heroku

```bash
heroku create your-app-name
heroku config:set ZOOM_CLIENT_ID=your_client_id
heroku config:set ZOOM_CLIENT_SECRET=your_client_secret
heroku config:set ZOOM_BOT_JID=your_bot_jid@xmpp.zoom.us
heroku config:set ZOOM_WEBHOOK_SECRET_TOKEN=your_secret
heroku config:set ZOOM_REDIRECT_URI=https://your-app-name.herokuapp.com/api/zoomapp/auth
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t poker-planner-zoom .

# Run container
docker run -p 3000:3000 --env-file .env poker-planner-zoom
```

## Migration from Slack

This app was migrated from the Slack Poker Planner with **90% feature parity**. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details on:
- Feature compatibility
- API mapping differences
- Known limitations

## Troubleshooting

**Bot doesn't respond:**
- Check webhook URL in Zoom Marketplace matches your public URL
- Verify credentials in `.env` are correct
- Check server logs for errors

**Messages not updating:**
- Ensure `is_markdown_support: true` is set in message body
- Check bot token is valid and not expired

**OAuth errors:**
- Verify `ZOOM_REDIRECT_URI` matches exactly in both `.env` and Zoom Marketplace
- Check `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` are correct

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

- Original Slack app: [slack-poker-planner](https://github.com/dgurkaynak/slack-poker-planner) by Deniz Gurkaynak
- Migrated to Zoom Team Chat using Claude Code's Slack-to-Zoom migration skill
