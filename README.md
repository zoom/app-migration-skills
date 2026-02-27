# Slack-to-Zoom Migration Skill

Migrate Slack apps to Zoom Team Chat with intelligent API mapping and working code generation.

**What it does:**
- 🔍 Analyzes Slack app structure and APIs
- 🗺️ Maps Slack APIs to Zoom equivalents (110+ API mappings)
- 💻 Generates working TypeScript/Node.js code with implemented handlers
- 🔧 Includes automatic error recovery for common issues
- 📊 Calculates feature parity (70-90% typical)
- 📚 Creates comprehensive documentation

---

## 📋 Prerequisites

Before installing, make sure you have:

- **Claude Code CLI** - [Install from Anthropic](https://claude.ai/download)
- **Git** - For cloning this repository
- **Node.js v16+** - For running generated Zoom apps
- **Zoom Developer Account** - [Create one here](https://marketplace.zoom.us)

---

## 🚀 Installation

### Option 1: No Installation Required (Easiest) ⭐

Clone once, use anywhere with the `--plugin-dir` flag:

**Step 1: Clone this repository**
```bash
# Option A: SSH (if you have SSH key configured)
git clone git@github.com:zoom/app-migration-skill.git

# Option B: HTTPS
git clone https://github.com/zoom/app-migration-skill.git

cd app-migration-skill
```

**Step 2: Note the full path**
```bash
pwd
# Example output: /Users/yourname/projects/app-migration-skill
```

**Step 3: Use it in any project**
```bash
cd your-project

# Replace /Users/yourname/projects/app-migration-skill with YOUR path from step 2
claude --plugin-dir /Users/yourname/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

**When to use:** Quick start, occasional use, testing, or multi-machine setup.

---

### Option 2: Install Globally (Recommended for Frequent Use)

One-time setup for permanent installation:

**Step 1: Clone and navigate**
```bash
# Option A: SSH (if you have SSH key configured)
git clone git@github.com:zoom/app-migration-skill.git

# Option B: HTTPS
git clone https://github.com/zoom/app-migration-skill.git

cd app-migration-skill
```

**Step 2: Create symlink**
```bash
# Ensure the skills directory exists
mkdir -p ~/.claude/skills

# Create the symlink
ln -s "$(pwd)/skills/slack-to-zoom-migrate" ~/.claude/skills/slack-to-zoom-migrate
```

**Step 3: Verify**
```bash
ls -la ~/.claude/skills/slack-to-zoom-migrate
# Should show a symlink pointing to your app-migration-skill directory
```

**Step 4: Use anywhere**

Now you can use the skill from any directory without the `--plugin-dir` flag:

```bash
cd any-project
claude
```

Inside Claude, the skill is automatically available.

**When to use:** Daily use, permanent setup, automatic updates.

---

## 💻 Usage

### Starting Claude

**Option 1 users:**
```bash
cd your-project
# Use the actual path from your pwd output (e.g., ~/projects/app-migration-skill)
claude --plugin-dir ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

**Option 2 users:**
```bash
cd your-project
claude
```

### Using the Skill

Once Claude starts, you'll see a prompt. Type the skill command:

```bash
# Migrate from GitHub
/slack-to-zoom-migrate https://github.com/company/slack-voting-bot

# Migrate from local directory
/slack-to-zoom-migrate ./my-slack-app
```

### What Happens Next?

The skill will:
1. **Analyze** your Slack app structure and features
2. **Generate** Zoom Team Chat code with working implementations
3. **Validate** generated code and apply automatic fixes when needed
4. **Create** a new directory: `zoom-[app-name]/`

**Generated files:**
```
zoom-voting-bot/
├── src/                    # TypeScript source code
├── package.json            # Dependencies
├── .env.example            # Configuration template
├── README.md               # Setup instructions
└── MIGRATION_GUIDE.md      # Feature parity analysis
```

**Time:** Several minutes depending on app complexity

---

### After Migration - Next Steps

Once migration completes, you'll have a new directory with your Zoom app. The generated code includes working implementations of your Slack app's features.

**Step 1: Install dependencies**
```bash
cd zoom-voting-bot/  # or whatever your app name is
npm install
```

**Step 2: Set up Zoom app credentials**

1. Create a Zoom Team Chat app at [marketplace.zoom.us](https://marketplace.zoom.us)
2. Copy your credentials
3. Configure your app:

```bash
cp .env.example .env
# Edit .env with your Zoom credentials:
# - ZOOM_CLIENT_ID
# - ZOOM_CLIENT_SECRET
# - ZOOM_BOT_JID
```

**Step 3: Set up public URL (Required for local testing)**

Zoom needs a public HTTPS URL to send webhook events to your bot. For local development, you need a tunneling service to expose your local port 3000 to the internet.

**Option A: ngrok (Easiest)**

ngrok creates a secure tunnel to your localhost.

```bash
# Install ngrok
brew install ngrok
# Or download from: https://ngrok.com/download

# Start tunnel to port 3000
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

Copy the `https://abc123.ngrok.io` URL - this is your public webhook URL.

**Option B: frp (Fast Reverse Proxy)**

frp is an alternative if you have your own frp server.

```bash
# Install frp client
brew install frp
# Or download from: https://github.com/fatedier/frp/releases

# Create frpc.ini configuration:
[common]
server_addr = your-frp-server.com
server_port = 7000

[zoom-bot]
type = http
local_port = 3000
custom_domains = your-subdomain.your-domain.com

# Start frp client
frpc -c frpc.ini
```

Your public URL: `https://your-subdomain.your-domain.com`

**Configure Zoom with your public URL:**

1. Go to [Zoom Marketplace](https://marketplace.zoom.us) → Your App → Features
2. Set **Bot Endpoint URL**: `https://your-url/webhooks/zoom`
3. Update `.env` → **ZOOM_REDIRECT_URI**: `https://your-url/api/zoomapp/auth`

**Step 4: Test locally**
```bash
npm run dev
```

Your bot should now receive webhook events from Zoom!

**Step 5: Review and deploy**

See the generated `README.md` and `MIGRATION_GUIDE.md` for:
- Feature implementation details
- Deployment instructions
- Zoom Marketplace setup steps
- Feature parity analysis
- Known limitations (if any)

---

## ✅ Verify Installation

Check that the skill is loaded correctly:

**Step 1: Start Claude**
```bash
claude
# or with --plugin-dir flag for Option 1 users
```

**Step 2: Check available skills**

Inside Claude prompt, type:
```
/help
```

**Step 3: Look for the skill**

You should see:
```
Available skills:
  - slack-to-zoom-migrate: Migrate Slack apps to Zoom Team Chat...
```

If you see this, you're all set! ✅

---

## 🔄 Updates

Both installation options stay in sync with the repository:

**For all users:**
```bash
cd app-migration-skill
git pull origin main
```

- **Option 1 users:** Next time you start Claude with `--plugin-dir`, it uses the latest version
- **Option 2 users:** Symlink automatically uses the latest version (no reinstall needed)

---

## 📋 Team Distribution

**Share this with your team:**

> 🎉 **New: Slack-to-Zoom Migration Skill**
>
> **Quick start:**
> ```bash
> # 1. Clone the repository
> git clone git@github.com:zoom/app-migration-skill.git
> # OR: git clone https://github.com/zoom/app-migration-skill.git
> cd app-migration-skill
> pwd  # Note this path
>
> # 2. Start Claude with the skill
> cd your-project
> claude --plugin-dir /YOUR/NOTED/PATH/skills/slack-to-zoom-migrate
>
> # 3. Use it
> /slack-to-zoom-migrate https://github.com/yourorg/your-slack-app
> ```
>
> **For permanent install:** See [Option 2 installation](https://github.com/zoom/app-migration-skill#option-2-install-globally-recommended-for-frequent-use)

---

## 🆘 Troubleshooting

### Skill not found?

**Option 1 troubleshooting:**

Check the path is correct:
```bash
# Use the actual path from your pwd output
ls ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
# Should show: skill.json, SKILL.md, executor.md, etc.
```

If not found, run `pwd` in the za-plans directory to get the correct path.

**Option 2 troubleshooting:**

Check symlink exists:
```bash
ls -la ~/.claude/skills/slack-to-zoom-migrate
# Should show a symlink (->)
```

If broken or missing, recreate it:
```bash
# Navigate to your app-migration-skill directory
cd ~/projects/app-migration-skill  # adjust path as needed

# Ensure the skills directory exists
mkdir -p ~/.claude/skills

# Recreate the symlink
ln -s "$(pwd)/skills/slack-to-zoom-migrate" ~/.claude/skills/slack-to-zoom-migrate
```

---

### Permission errors?

Fix file permissions:
```bash
# Use your actual path
chmod -R 755 ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

---

### Claude doesn't start?

Make sure Claude Code CLI is installed:
```bash
claude --version
```

If not found, [install Claude Code](https://claude.ai/download).

---

### Still having issues?

Ask Claude directly (if Claude starts):
```
Check if the slack-to-zoom-migrate skill is properly set up
```

Or open an issue on [GitHub](https://github.com/zoom/app-migration-skill/issues).

---

## 📂 Repository Structure

```
app-migration-skill/
├── README.md                      # This file
└── skills/
    └── slack-to-zoom-migrate/     # Main skill
        ├── skill.json             # Skill metadata
        ├── SKILL.md               # Skill instructions
        ├── executor.md            # Execution flow
        ├── docs/                  # 110+ API links
        │   ├── API_MAPPING_REFERENCE.md
        │   ├── ZOOM_DOCS_DIRECTORY.md
        │   ├── SLACK_DOCS_DIRECTORY.md
        │   └── code-examples/     # 8 working examples
        └── templates/
            └── general/           # Code generation templates
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes to `skills/slack-to-zoom-migrate/`
4. Test with various Slack apps
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Users with symlinked installations (Option 2) get updates automatically on `git pull`.

---

## 📚 Documentation

**Skill Documentation:**
- **[Skill Overview](skills/slack-to-zoom-migrate/SKILL_OVERVIEW.md)** - Quick reference
- **[API Mapping Reference](skills/slack-to-zoom-migrate/docs/API_MAPPING_REFERENCE.md)** - 50+ API mappings
- **[Zoom API Directory](skills/slack-to-zoom-migrate/docs/ZOOM_DOCS_DIRECTORY.md)** - 40+ Zoom docs links
- **[Slack API Directory](skills/slack-to-zoom-migrate/docs/SLACK_DOCS_DIRECTORY.md)** - 70+ Slack docs links
- **[Code Examples](skills/slack-to-zoom-migrate/docs/code-examples/)** - 8 working examples

**External Resources:**
- [Zoom Team Chat API](https://developers.zoom.us/docs/team-chat/)
- [Zoom App Marketplace](https://marketplace.zoom.us)
- [Slack API Documentation](https://api.slack.com/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Zoom Video Communications, Inc.

---

**Last Updated:** 2026-02-25
