# Slack-to-Zoom Migration Skill

An automated migration tool for converting Slack applications to Zoom Team Chat with intelligent API mapping and code generation.

## Overview

This skill provides comprehensive migration capabilities for transforming Slack applications into Zoom Team Chat applications:

- **Automated Analysis**: Examines Slack application structure and API usage patterns
- **Comprehensive API Mapping**: Converts 110+ Slack API calls to Zoom equivalents
- **Code Generation**: Produces production-ready TypeScript/Node.js code with implemented handlers
- **Error Recovery**: Includes automatic validation and error correction mechanisms
- **Feature Parity Analysis**: Calculates migration completeness (typically 80-95%)
- **Complete Documentation**: Generates setup guides, migration reports, and API documentation

## Prerequisites

The following tools and accounts are required:

- **Claude Code CLI** - [Install from Anthropic](https://claude.ai/download)
- **Git** - Version control system for repository management
- **Node.js v16+** - Runtime environment for generated Zoom applications
- **Zoom Developer Account** - Register at [marketplace.zoom.us](https://marketplace.zoom.us)

## Installation

### Option 1: Direct Usage via Plugin Directory

This method allows usage without permanent installation by specifying the plugin directory path at runtime.

**Step 1: Clone the repository**
```bash
# Option A: SSH (if you have SSH key configured)
git clone git@github.com:zoom/app-migration-skill.git

# Option B: HTTPS
git clone https://github.com/zoom/app-migration-skill.git

cd app-migration-skill
```

**Step 2: Record the installation path**
```bash
pwd
# Example output: /Users/yourname/projects/app-migration-skill
```

**Step 3: Launch with plugin directory flag**
```bash
cd your-project

# Replace with your actual path from Step 2
claude --plugin-dir /Users/yourname/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

**Recommended for**: Initial evaluation, temporary usage, testing environments, or multi-system deployments.

### Option 2: Global Installation (Recommended)

Permanent installation via symbolic link for streamlined access:

**Step 1: Clone the repository**
```bash
# Option A: SSH (if you have SSH key configured)
git clone git@github.com:zoom/app-migration-skill.git

# Option B: HTTPS
git clone https://github.com/zoom/app-migration-skill.git

cd app-migration-skill
```

**Step 2: Create symbolic link**
```bash
# Initialize skills directory
mkdir -p ~/.claude/skills

# Create symbolic link to skill
ln -s "$(pwd)/skills/slack-to-zoom-migrate" ~/.claude/skills/slack-to-zoom-migrate
```

**Step 3: Verify installation**
```bash
ls -la ~/.claude/skills/slack-to-zoom-migrate
# Output should display symlink reference to installation directory
```

**Step 4: Launch Claude Code**

The skill is now available in all Claude Code sessions:

```bash
cd any-project
claude
```

**Recommended for**: Production environments, frequent usage, and automatic update propagation.

### Option 3: Marketplace Plugin Installation

Install directly via the Claude Code plugin marketplace using the repository's `.claude-plugin/marketplace.json` configuration. Run these commands from within any Claude Code session.

**Step 1: Clone the repository**
```bash
git clone git@github.com:zoom/app-migration-skill.git
# Alternative: git clone https://github.com/zoom/app-migration-skill.git

cd app-migration-skill
pwd
# Example output: /Users/yourname/projects/app-migration-skill
```

**Step 2: Register the marketplace**

Use the absolute path from Step 1:
```
/plugin marketplace add /Users/yourname/projects/app-migration-skill
```

**Step 3: Install the plugin**
```
/plugin install slack-to-zoom@app-migration-skills
```

This makes the following skills available:
- `slack-to-zoom` — Migrate Slack apps to Zoom Team Chat
- `zoom-chat-app-boilerplate` — Generate a production-ready Zoom Team Chat app boilerplate

Alternatively, use the interactive UI — run `/plugin`, navigate to **Marketplaces** and enter the absolute path (e.g. `/Users/yourname/projects/app-migration-skill`), then **Discover** to browse and install.

**Step 4: Verify installation**
```
/help
# Expected: slack-to-zoom-migrate listed under available skills
```

**Recommended for**: Teams that want a single-command setup or when distributing to multiple developers without manual cloning or symlink management.

## Usage

### Launching Claude Code

**For Option 1 installations:**
```bash
cd your-project
claude --plugin-dir ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

**For Option 2 installations:**
```bash
cd your-project
claude
```

**For Option 3 installations:**
```bash
cd your-project
claude
```

### Executing Migration

Invoke the skill with the following command syntax:

```bash
# Migrate from GitHub repository
/slack-to-zoom-migrate https://github.com/company/slack-voting-bot

# Migrate from local filesystem
/slack-to-zoom-migrate ./my-slack-app
```

### Migration Process

The skill performs the following operations:

1. **Analysis**: Examines Slack application structure and feature implementation
2. **Code Generation**: Produces Zoom Team Chat application with functional implementations
3. **Validation**: Verifies generated code integrity and applies automated corrections
4. **Output Creation**: Generates project directory: `zoom-[app-name]/`

**Generated project structure:**
```
zoom-voting-bot/
├── src/                    # TypeScript source code
├── package.json            # Dependencies and scripts
├── .env.example            # Environment configuration template
├── README.md               # Setup and deployment instructions
└── MIGRATION_GUIDE.md      # Feature parity analysis report
```

**Processing time**: Varies based on application complexity (typically 2-10 minutes)

### Post-Migration Configuration

After migration completion, configure and deploy the generated Zoom application:

**Step 1: Install project dependencies**
```bash
cd zoom-voting-bot/  # Navigate to generated project directory
npm install
```

**Step 2: Configure Zoom application credentials**

1. Create a Team Chat application at [Zoom Marketplace](https://marketplace.zoom.us)
2. Obtain application credentials from the App Credentials page
3. Configure environment variables:

```bash
cp .env.example .env
# Configure the following credentials in .env:
# - ZOOM_CLIENT_ID
# - ZOOM_CLIENT_SECRET
# - ZOOM_BOT_JID
```

**Step 3: Configure webhook endpoint (required for local development)**

Zoom Team Chat requires a publicly accessible HTTPS endpoint for webhook delivery. Local development requires a tunneling service to expose port 3000.

**Option A: ngrok**

Establishes secure tunneling to localhost:

```bash
# Install ngrok via Homebrew
brew install ngrok
# Or download from https://ngrok.com/download

# Initialize tunnel
ngrok http 3000
```

Output displays forwarding URL:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

Note the HTTPS URL for webhook configuration.

**Option B: frp (Fast Reverse Proxy)**

Alternative tunneling solution for self-hosted proxy servers:

```bash
# Install frp client
brew install frp
# Or download from https://github.com/fatedier/frp/releases

# Configure frpc.ini:
[common]
server_addr = your-frp-server.com
server_port = 7000

[zoom-bot]
type = http
local_port = 3000
custom_domains = your-subdomain.your-domain.com

# Initialize client
frpc -c frpc.ini
```

Public URL format: `https://your-subdomain.your-domain.com`

**Configure Zoom application endpoints:**

1. Navigate to [Zoom Marketplace](https://marketplace.zoom.us) → Your App → Features
2. Configure **Bot Endpoint URL**: `https://your-url/webhooks/zoom`
3. Set `.env` variable **ZOOM_REDIRECT_URI**: `https://your-url/api/zoomapp/auth`

**Step 4: Launch development server**
```bash
npm run dev
```

The application is now configured to receive Zoom webhook events.

**Step 5: Review documentation and deploy**

Consult the generated documentation for complete deployment guidance:

- `README.md` - Feature implementation details and deployment procedures
- `MIGRATION_GUIDE.md` - Feature parity analysis, Marketplace configuration, and known limitations

## Installation Verification

Confirm successful skill installation:

**Step 1: Launch Claude Code**
```bash
claude
# Option 1 users: include --plugin-dir flag
# Option 3 users: no flags needed after installation
```

**Step 2: Query available skills**

Execute the help command:
```
/help
```

**Step 3: Verify skill registration**

Expected output:
```
Available skills:
  - slack-to-zoom-migrate: Migrate Slack apps to Zoom Team Chat...
```

Presence of this entry confirms successful installation.

## Updates

Maintain current version by synchronizing with the repository:

**For all users:**
```bash
cd app-migration-skill
git pull origin main
```

**Installation-specific behavior:**
- **Option 1**: Updated version applies on next `--plugin-dir` invocation
- **Option 2**: Symbolic link automatically references updated version
- **Option 3**: Re-run `/plugin install slack-to-zoom@app-migration-skills` inside Claude Code to update to the latest version

## Team Distribution

**Onboarding documentation for team members:**

> **Slack-to-Zoom Migration Skill**
>
> **Quick Start Guide:**
> ```bash
> # 1. Clone repository
> git clone git@github.com:zoom/app-migration-skill.git
> # Alternative: git clone https://github.com/zoom/app-migration-skill.git
> cd app-migration-skill
> pwd  # Record this path
>
> # 2. Launch Claude Code with skill
> cd your-project
> claude --plugin-dir /YOUR/RECORDED/PATH/skills/slack-to-zoom-migrate
>
> # 3. Execute migration
> /slack-to-zoom-migrate https://github.com/yourorg/your-slack-app
> ```
>
> **For permanent installation:** Refer to [Option 2: Global Installation](https://github.com/zoom/app-migration-skill#option-2-global-installation-recommended) or [Option 3: Marketplace Plugin Installation](https://github.com/zoom/app-migration-skill#option-3-marketplace-plugin-installation)

## Troubleshooting

### Skill Not Detected

**Option 1 diagnosis:**

Verify directory path accuracy:
```bash
# Confirm path matches pwd output from installation
ls ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
# Expected contents: skill.json, SKILL.md, executor.md
```

If files are not present, re-execute `pwd` in the installation directory to obtain the correct path.

**Option 2 diagnosis:**

Verify symbolic link integrity:
```bash
ls -la ~/.claude/skills/slack-to-zoom-migrate
# Expected output: symbolic link indicator (->)
```

If missing or invalid, recreate the symbolic link:
```bash
# Navigate to installation directory
cd ~/projects/app-migration-skill  # Adjust path as needed

# Initialize skills directory
mkdir -p ~/.claude/skills

# Create symbolic link
ln -s "$(pwd)/skills/slack-to-zoom-migrate" ~/.claude/skills/slack-to-zoom-migrate
```

**Option 3 diagnosis:**

Re-register and reinstall from within Claude Code using the absolute path to the cloned repo:
```
/plugin marketplace add /Users/yourname/projects/app-migration-skill
/plugin install slack-to-zoom@app-migration-skills
```

### Permission Issues

Correct file permissions:
```bash
chmod -R 755 ~/projects/app-migration-skill/skills/slack-to-zoom-migrate
```

### Claude Code Launch Failure

Verify CLI installation:
```bash
claude --version
```

If command not found, install from [claude.ai/download](https://claude.ai/download).

### Additional Support

For persistent issues:

1. Query Claude Code directly (if accessible):
   ```
   Check if the slack-to-zoom-migrate skill is properly set up
   ```

2. Submit issue report at [GitHub Issues](https://github.com/zoom/app-migration-skill/issues)

## Repository Structure

```
app-migration-skill/
├── .claude-plugin/
│   └── marketplace.json           # Plugin marketplace configuration
├── README.md                      # Project documentation
└── skills/
    └── slack-to-zoom-migrate/     # Primary skill implementation
        ├── SKILL.md               # Skill implementation instructions
        ├── README.md              # Skill-level documentation
        ├── commands/              # Slash command definitions
        │   └── slack-to-zoom-migrate.md
        ├── core/                  # Core execution logic
        │   ├── executor.md        # Execution workflow
        │   └── instructions.md   # Detailed migration instructions
        ├── docs/                  # API reference documentation
        │   ├── API_MAPPING_REFERENCE.md     # 110+ API mappings
        │   ├── api-mapping/                 # Granular API mapping docs
        │   │   ├── events-webhooks.md
        │   │   ├── formatting.md
        │   │   ├── interactivity.md
        │   │   ├── messaging-api.md
        │   │   ├── oauth-auth.md
        │   │   └── slash-commands.md
        │   ├── ZOOM_OFFICIAL_DOCS.md        # Zoom API documentation
        │   ├── SLACK_DOCS_DIRECTORY.md      # Slack API documentation
        │   └── code-examples/               # Implementation examples
        ├── examples/              # Example migrated applications
        │   └── poker-planner-zoom/          # Full example migration
        ├── reference/             # Quick reference materials
        │   ├── COMMON_BUGS.md
        │   ├── FAQ.md
        │   ├── QUICK_REFERENCE.md
        │   └── VALIDATION_EXAMPLES.md
        └── templates/             # Code generation templates
            └── general/           # Base project template
```

## Contributing

Contributions are welcomed through the standard fork and pull request workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Implement changes in `skills/slack-to-zoom-migrate/`
4. Validate with multiple Slack application migrations
5. Commit changes: `git commit -m 'Add feature description'`
6. Push to branch: `git push origin feature/feature-name`
7. Submit pull request

Note: Option 2 installations automatically reflect updates via symbolic link on `git pull`.

## Documentation

**Internal Documentation:**
- [Skill Overview](skills/slack-to-zoom-migrate/SKILL_OVERVIEW.md) - Quick reference guide
- [API Mapping Reference](skills/slack-to-zoom-migrate/docs/API_MAPPING_REFERENCE.md) - 50+ API mappings
- [Zoom API Directory](skills/slack-to-zoom-migrate/docs/ZOOM_DOCS_DIRECTORY.md) - 40+ documentation links
- [Slack API Directory](skills/slack-to-zoom-migrate/docs/SLACK_DOCS_DIRECTORY.md) - 70+ documentation links
- [Code Examples](skills/slack-to-zoom-migrate/docs/code-examples/) - 8 implementation examples

**External Resources:**
- [Zoom Team Chat API Documentation](https://developers.zoom.us/docs/team-chat/)
- [Zoom App Marketplace](https://marketplace.zoom.us)
- [Slack API Documentation](https://api.slack.com/)

## License

Licensed under the MIT License. See [LICENSE](LICENSE) file for complete terms.

Copyright (c) 2026 Zoom Video Communications, Inc.

---

**Last Updated:** 2026-03-12
