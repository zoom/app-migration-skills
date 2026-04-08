# Zoom Marketplace Setup Checklist

Complete guide for configuring your Planning Poker bot in Zoom Marketplace.

## Prerequisites

- [ ] Zoom account with Team Chat enabled
- [ ] Access to [Zoom Marketplace](https://marketplace.zoom.us/)
- [ ] Node.js 18+ installed
- [ ] Public HTTPS URL (ngrok, frp, or deployed server)

---

## Part 1: Create Zoom App (10 minutes)

### 1.1 Create New App

- [ ] Go to [marketplace.zoom.us](https://marketplace.zoom.us/)
- [ ] Click **Develop** → **Build App**
- [ ] Choose **Team Chat App**
- [ ] Click **Create**

### 1.2 Basic Information

- [ ] **App Name:** `Planning Poker` (or your preferred name)
- [ ] **Short Description:** `Interactive planning poker for agile estimation`
- [ ] **Long Description:** Add detailed description of the app
- [ ] **Developer Name:** Your name or company
- [ ] **Developer Email:** Your contact email
- [ ] Click **Continue**

### 1.3 App Credentials

**🔴 IMPORTANT: Save these credentials - you'll need them later!**

- [ ] Copy **Client ID** → Save to notes
- [ ] Copy **Client Secret** → Save to notes (click "View" to reveal)
- [ ] Click **Continue**

---

## Part 2: Configure Features (5 minutes)

### 2.1 Enable Chatbot

- [ ] Go to **Features** tab
- [ ] Toggle **Chatbot** to **ON**
- [ ] **Bot Name:** `Planning Poker`
- [ ] **Short Description:** `Interactive planning poker bot`

### 2.2 Bot Credentials

**🔴 IMPORTANT: Save these credentials!**

- [ ] Copy **Bot JID** (format: `username@xmpp.zoom.us` or `username@xmppdev.zoom.us`)
- [ ] Copy **Secret Token** (this is your WEBHOOK_SECRET_TOKEN)
- [ ] Save both to your notes

### 2.3 Bot Endpoint URL

**⚠️ You need a public HTTPS URL before setting this**

If using ngrok for local testing:
```bash
ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

- [ ] **Bot Endpoint URL:** `https://your-url/webhooks/zoom`
- [ ] Example: `https://abc123.ngrok.io/webhooks/zoom`
- [ ] Click **Save**

### 2.4 Slash Commands

- [ ] Click **Add Slash Command**
- [ ] **Command:** `/pp`
- [ ] **Hint:** `[title] [options]`
- [ ] **Description:** `Start a planning poker session`
- [ ] Click **Save**

### 2.5 OAuth Redirect URL

- [ ] Go to **OAuth** section (if visible) or **App Credentials**
- [ ] Add **Redirect URL for OAuth:** `https://your-url/api/zoomapp/auth`
- [ ] Example: `https://abc123.ngrok.io/api/zoomapp/auth`
- [ ] Click **Continue** or **Save**

---

## Part 3: Local Setup (5 minutes)

### 3.1 Install Dependencies

```bash
cd poker-planner-zoom
npm install
```

- [ ] Dependencies installed successfully

### 3.2 Configure Environment

- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] Edit `.env` and fill in credentials:

```bash
# From Zoom Marketplace → App Credentials
ZOOM_CLIENT_ID=your_client_id_here

# From Zoom Marketplace → App Credentials (click View)
ZOOM_CLIENT_SECRET=your_client_secret_here

# From Zoom Marketplace → Features → Chatbot → Bot JID
ZOOM_BOT_JID=your_bot_jid@xmpp.zoom.us

# From Zoom Marketplace → Features → Chatbot → Secret Token
ZOOM_WEBHOOK_SECRET_TOKEN=your_secret_token_here

# Your public URL + /api/zoomapp/auth
ZOOM_REDIRECT_URI=https://your-url/api/zoomapp/auth

# API endpoints (use these for production)
ZOOM_API_HOST=https://api.zoom.us
ZOOM_OAUTH_HOST=https://zoom.us

# For development environment, use:
# ZOOM_API_HOST=https://zoomdev.us
# ZOOM_OAUTH_HOST=https://zoomdev.us
```

### 3.3 Development Environment Detection

**If using development credentials (`@xmppdev.zoom.us`):**
- [ ] Update API endpoints in `.env`:
  ```bash
  ZOOM_API_HOST=https://zoomdev.us
  ZOOM_OAUTH_HOST=https://zoomdev.us
  ```

**If using production credentials (`@xmpp.zoom.us`):**
- [ ] Keep default settings:
  ```bash
  ZOOM_API_HOST=https://api.zoom.us
  ZOOM_OAUTH_HOST=https://zoom.us
  ```

### 3.4 Verify Configuration

Run this command to check your setup:

```bash
# This will validate environment variables
npm run dev
```

- [ ] Server starts without errors
- [ ] See message: `Server is running on port 3000`
- [ ] See message: `Zoom config loaded successfully`

---

## Part 4: Expose Local Server (5 minutes)

### Option A: ngrok (Recommended for testing)

```bash
ngrok http 3000
```

- [ ] Copy HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Update **Bot Endpoint URL** in Zoom Marketplace: `https://abc123.ngrok.io/webhooks/zoom`
- [ ] Update **ZOOM_REDIRECT_URI** in `.env`: `https://abc123.ngrok.io/api/zoomapp/auth`
- [ ] Restart server: `npm run dev`

### Option B: frp (if configured)

```bash
frpc -c frpc.ini
```

- [ ] Copy your FRP HTTPS URL
- [ ] Update Bot Endpoint URL in Zoom Marketplace
- [ ] Update ZOOM_REDIRECT_URI in `.env`
- [ ] Restart server

---

## Part 5: Testing (5 minutes)

### 5.1 Install Bot in Zoom

- [ ] Go to [marketplace.zoom.us](https://marketplace.zoom.us/)
- [ ] Go to **Manage** → **Your Apps**
- [ ] Find your app and click **Install**
- [ ] Authorize the app
- [ ] Select a channel to add the bot

### 5.2 Basic Tests

**Test 1: Help Command**
```
/pp help
```
- [ ] Bot responds with help message
- [ ] Help includes command syntax and examples

**Test 2: Create Session**
```
/pp Test session
```
- [ ] Poll message appears in channel
- [ ] Message shows session title
- [ ] Voting buttons are visible (0, 1, 2, 3, 5, 8, 13, 21, ?)
- [ ] Reveal and Cancel buttons are visible

**Test 3: Vote**
- [ ] Click on a point button (e.g., "5")
- [ ] Message updates to show vote count
- [ ] Vote is recorded

**Test 4: Reveal**
- [ ] Click "👁 Reveal" button
- [ ] Results are shown with vote distribution
- [ ] Average is calculated (if numeric points)
- [ ] Restart button appears

**Test 5: Restart**
- [ ] Click "🔄 Restart" button
- [ ] New session starts with same settings
- [ ] Votes are reset
- [ ] Voting buttons are active again

**Test 6: Cancel**
- [ ] Start a new session: `/pp Cancel test`
- [ ] Click "❌ Cancel" button
- [ ] Session shows as cancelled
- [ ] Restart button appears

**Test 7: Custom Points**
```
/pp Sprint planning points:XS,S,M,L,XL
```
- [ ] Custom points appear as buttons (XS, S, M, L, XL)
- [ ] Voting works with custom points
- [ ] Reveal shows results correctly

### 5.3 Multi-User Tests (with teammate)

- [ ] Have 2+ users vote on same session
- [ ] Verify vote count updates correctly
- [ ] Reveal shows all votes
- [ ] Average calculation is correct

---

## Part 6: Troubleshooting

### Bot doesn't respond to `/pp`

**Check:**
- [ ] Server is running (`npm run dev`)
- [ ] ngrok/frp is running
- [ ] Bot Endpoint URL in Zoom Marketplace is correct
- [ ] Webhook Secret Token in `.env` matches Marketplace

**Fix:**
```bash
# Check server logs
npm run dev

# You should see:
# "Slash command from User: /pp ..."
```

### "Webhook validation failed"

**Check:**
- [ ] `ZOOM_WEBHOOK_SECRET_TOKEN` in `.env` matches Marketplace
- [ ] No extra spaces in `.env` values
- [ ] Secret token was copied correctly

**Fix:**
```bash
# Re-copy secret token from Zoom Marketplace
# Features → Chatbot → Secret Token
```

### "OAuth token error"

**Check:**
- [ ] `ZOOM_CLIENT_ID` is correct
- [ ] `ZOOM_CLIENT_SECRET` is correct (click "View" to see it)
- [ ] Bot JID format is correct (`username@xmpp.zoom.us`)

**Fix:**
```bash
# Verify credentials in .env match Marketplace exactly
# Restart server after updating .env
```

### Messages not updating

**Check:**
- [ ] `is_markdown_support: true` is set in message body
- [ ] Token is not expired (token cache automatically refreshes)

**Fix:**
```bash
# Check server logs for "Token refreshed" messages
# Restart server to force token refresh
```

### ngrok URL changed

**When ngrok URL changes:**
- [ ] Update Bot Endpoint URL in Zoom Marketplace
- [ ] Update `ZOOM_REDIRECT_URI` in `.env`
- [ ] Restart server: `npm run dev`

---

## Part 7: Production Deployment

### 7.1 Choose Hosting Platform

- [ ] Heroku / Railway / Render / AWS / etc.
- [ ] Deploy your code
- [ ] Set environment variables on hosting platform
- [ ] Get production HTTPS URL

### 7.2 Update Zoom Marketplace

- [ ] Update **Bot Endpoint URL** to production URL
- [ ] Update **OAuth Redirect URL** to production URL
- [ ] Test with production URL

### 7.3 Production Environment Variables

Make sure these are set on your hosting platform:

```bash
PORT=3000
NODE_ENV=production
APP_NAME=Planning Poker
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_BOT_JID=your_bot_jid@xmpp.zoom.us
ZOOM_WEBHOOK_SECRET_TOKEN=your_secret_token
ZOOM_API_HOST=https://api.zoom.us
ZOOM_OAUTH_HOST=https://zoom.us
ZOOM_REDIRECT_URI=https://your-production-url.com/api/zoomapp/auth
```

---

## Checklist Complete! 🎉

If you've checked all boxes above, your Planning Poker bot is ready to use!

### Quick Reference

**Start session:**
```
/pp [title] [points:custom,values]
```

**Examples:**
- `/pp User story estimation`
- `/pp Sprint planning points:1,2,3,5,8,13`
- `/pp help`

### Support

If you encounter issues:
1. Check server logs for errors
2. Verify all credentials match between `.env` and Zoom Marketplace
3. Ensure public URL is accessible
4. Review [README.md](./README.md) for detailed documentation
5. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for API details

**Happy Planning! 🃏**
