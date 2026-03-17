---
description: Convert a Slack app to Zoom Team Chat app
argument-hint: <github-url-or-path>
allowed-tools: [Bash, Read, Write, Glob, Grep, Task, AskUserQuestion, Edit]
---

# Slack to Zoom Migration Command

Automatically migrate Slack apps to Zoom Team Chat with intelligent analysis, API mapping, and production-ready code generation.

This Claude command is a thin wrapper. Shared implementation lives in `../../../shared/slack-to-zoom-migrate/`.

## Arguments

**Required:** `<github-url-or-path>`
- GitHub repository URL (e.g., `https://github.com/user/slack-app`)
- Local directory path (e.g., `./my-slack-app`)

## What This Command Does

When invoked, this command will:

1. 🔍 **Analyze** the Slack app codebase (from GitHub or local path)
2. 🗺️ **Map** Slack APIs to Zoom Team Chat equivalents
3. 💻 **Generate** production-ready TypeScript/Node.js code with rich markdown formatting
4. 📊 **Calculate** feature parity percentage (typically 70-90%)
5. 📚 **Create** comprehensive documentation and setup guides
6. ✅ **Validate** the generated code with tests and server startup

## Usage Examples

### GitHub Repository
```bash
/slack-to-zoom-migrate https://github.com/dgurkaynak/slack-poker-planner
```

### Local Directory
```bash
/slack-to-zoom-migrate ./my-slack-app
```

### Another GitHub Example
```bash
/slack-to-zoom-migrate https://github.com/user/custom-slack-bot
```

## Generated Output

The command will create a new Zoom app directory with:

**Generated Code:**
- Complete TypeScript/Node.js project
- OAuth authentication flow
- Webhook handlers (slash commands, buttons)
- Message sending with rich markdown formatting
- Session/state management (if needed)
- Comprehensive test suite

**Documentation:**
- `README.md` - Setup and deployment guide
- `MIGRATION_GUIDE.md` - Feature parity analysis
- `SETUP_CHECKLIST.md` - Zoom Marketplace configuration
- `.env.example` - Configuration template

**Typical Results:**
- ✅ 70-90% feature parity (varies by app)
- ✅ 0-5 manual fixes required
- ✅ Production-ready code
- ✅ ~10 minute setup time

## Execution Flow

The command executes 6 phases:

### Phase 1: Repository Analysis (30-45s)
- Clone/read the Slack app source code
- Identify framework, language, and structure
- Catalog all features (commands, buttons, events, modals)

### Phase 2: Feature Mapping (30-45s)
- Map Slack APIs to Zoom equivalents
- Calculate feature parity percentage
- Identify limitations and workarounds

### Phase 3: Code Generation (60-90s)
- Generate complete TypeScript project
- Apply Zoom-specific fixes
- Implement business logic

### Phase 4: Documentation (30-45s)
- Generate README, migration guide, setup checklist

### Phase 5: Validation (MANDATORY)
- Ask user for Zoom credentials
- Run npm install and tests
- Start server and validate endpoints

### Phase 6: Final Summary (5-10s)
- Display comprehensive results
- Show validation status
- Provide next steps

## Migration Capabilities

**Full Migration:**
- ✅ Slash commands
- ✅ Interactive buttons
- ✅ Basic messages
- ✅ OAuth flows
- ✅ Webhooks
- ✅ Session state

**Partial Migration:**
- ⚠️ Simple modals → Inline message cards
- ⚠️ Block Kit → Markdown approximation

**Cannot Migrate:**
- ❌ Apps requiring passive message listening
- ❌ Complex multi-step modal workflows
- ❌ App Home tabs
- ❌ Rich text formatting (colors, fonts)

## Important Notes

### Rich Formatting Required
All generated messages use rich Zoom markdown formatting with:
- Visual separators (`━━━━━━`)
- Bold titles with emojis (`*🎯 Title*`)
- Emoji-rich headers
- Button chunking (5 per row)
- Individual status displays (not just counts)

### Validation Phase
The validation phase is mandatory and will:
- Request Zoom credentials via interactive prompts
- Test the generated code
- Apply auto-fixes if needed
- Ensure production-readiness

## Requirements

**User must provide:**
- Valid Slack app source code (GitHub URL or local path)
- Zoom credentials for validation (Client ID, Client Secret, Bot JID)

**System requirements:**
- Node.js 18+ (for running generated code)
- npm or yarn (for dependency installation)
- Internet access (for Zoom API validation)

## Support

For detailed documentation, see:
- `../../../shared/slack-to-zoom-migrate/core/executor.md` - Detailed execution flow
- `../../../shared/slack-to-zoom-migrate/docs/API_MAPPING_REFERENCE.md` - Complete API mappings
- `../../../shared/slack-to-zoom-migrate/docs/RICH_FORMATTING_CHECKLIST.md` - Formatting guidelines
- `../../../shared/slack-to-zoom-migrate/examples/poker-planner-zoom/` - Working example
