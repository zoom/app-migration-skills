---
name: slack-to-zoom-migrate
description: Converts Slack apps to Zoom Team Chat. Accepts GitHub URL or local path, generates TypeScript code with API mappings, OAuth, webhooks, and docs. Invoke when user mentions migrating, converting, or porting a Slack app/bot to Zoom.
version: 1.0.0
---

# Slack to Zoom Team Chat Migration Skill

Automatically migrate Slack apps to Zoom Team Chat with intelligent analysis, API mapping, and production-ready code generation.

## What This Skill Does

When invoked, this skill will:
1. 🔍 **Analyze** the Slack app codebase (from GitHub or local path)
2. 🗺️ **Map** Slack APIs to Zoom Team Chat equivalents
3. 💻 **Generate** production-ready TypeScript/Node.js code with **rich markdown formatting**
4. 📊 **Calculate** feature parity percentage (typically 70-90%)
5. 📚 **Create** comprehensive documentation and setup guides
6. ✅ **Validate** the generated code with tests and server startup

## ⚠️ CRITICAL: Rich Formatting Required

**ALL generated messages MUST use rich formatting patterns.** Never generate plain messages.

**Quick Reference:** `docs/RICH_FORMATTING_CHECKLIST.md`

**🚨 CRITICAL STRUCTURE:**
- ✅ Use **multiple body items** (separate sections)
- ❌ NEVER concatenate into single text field

**Required patterns:**
- ✅ Visual separators (`━━━━━━`)
- ✅ Bold titles with emojis (`*🎯 Title*`) - Single asterisk!
- ✅ Individual status (not just counts)
- ✅ Emoji-rich headers (`*📊 Status*`)
- ✅ Button chunking (5 per row)
- ✅ Visual bars for results (`▰▰▰`)

**Correct Structure:**
```typescript
const body: any[] = [];
body.push({ type: 'message', text: `*🎯 Title*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `👤 _Creator_` });
// ... more sections
return { head: { text: 'App' }, body: body };
```

**Working example:** `examples/poker-planner-zoom/src/zoom/messaging.ts`

## Usage

```
/slack-to-zoom-migrate <github-url-or-path>
```

**Examples:**
```bash
/slack-to-zoom-migrate https://github.com/dgurkaynak/slack-poker-planner
/slack-to-zoom-migrate ./my-slack-app
/slack-to-zoom-migrate https://github.com/user/slack-bot
```

## Implementation Instructions

All file paths referenced in this skill are relative to the skill directory root (`skills/slack-to-zoom-migrate/`).

When this skill is invoked with arguments (GitHub URL or local path), follow these steps:

### Step 1: Parse Input
Extract the repository URL or local path from the arguments provided after the command.

### Step 2: Read Execution Instructions
Read the detailed execution flow from (relative to skill directory):
- `core/executor.md` - Demo-worthy execution flow with timing and progress
- `core/instructions.md` - Technical implementation details

### Step 3: Execute All 6 Phases

**MANDATORY: Complete all phases in order**

1. **Phase 1: Repository Analysis** (30-45s)
   - Clone/read the Slack app source code
   - Identify framework, language, and structure
   - Catalog all features (commands, buttons, events, modals)

2. **Phase 2: Feature Mapping** (30-45s)
   - Map Slack APIs to Zoom equivalents
   - Calculate feature parity percentage
   - Identify limitations and workarounds

3. **Phase 3: Code Generation** (60-90s)
   - Use templates from `templates/general/` as foundation
   - Generate app-specific business logic
   - Apply all Zoom-specific fixes
   - Create complete TypeScript project

4. **Phase 4: Documentation** (30-45s)
   - Generate README.md with setup instructions
   - Create MIGRATION_GUIDE.md with feature analysis
   - Generate SETUP_CHECKLIST.md for Zoom Marketplace

5. **Phase 5: Validation** (MANDATORY)
   - Ask user for credentials (using AskUserQuestion)
   - Run npm install and npm test
   - Start server and test endpoints
   - Apply auto-fixes if needed

6. **Phase 6: Final Summary** (5-10s)
   - Display comprehensive results
   - Show validation status
   - Provide next steps

### Step 4: Use Available Resources

Reference documentation (relative to skill directory):
- `docs/API_MAPPING_REFERENCE.md` - Complete API mappings
- `docs/ASYNC_OPERATIONS.md` - State management patterns
- `docs/BUTTON_PATTERNS.md` - **CRITICAL:** Button context patterns (restart, multi-step flows)
- `docs/OMITTED_FIELDS.md` - Field availability reference
- `docs/code-examples/` - Implementation examples

### Step 5: Output

Generate the Zoom app in: `./slack-to-zoom-migrate-output/` or `<app-name>-zoom/`

## What You Get

**Generated Code:**
- Complete TypeScript/Node.js project
- OAuth authentication flow
- Webhook handlers (slash commands, buttons)
- Message sending with markdown
- Session/state management (if needed)
- Comprehensive test suite

**Documentation:**
- README.md - Setup and deployment guide
- MIGRATION_GUIDE.md - Feature parity analysis
- SETUP_CHECKLIST.md - Zoom Marketplace configuration
- .env.example - Configuration template

**Typical Results:**
- ✅ 70-90% feature parity (varies by app)
- ✅ 0-5 manual fixes required
- ✅ Production-ready code
- ✅ ~10 minute setup time

## Known Limitations

**Cannot migrate:**
- Apps requiring passive message listening
- Complex multi-step modal workflows
- App Home tabs
- Rich text formatting (colors, fonts)

**Partial migration:**
- Simple modals → Inline message cards
- Block Kit → Markdown approximation

**Full migration:**
- Slash commands
- Interactive buttons
- Basic messages
- OAuth flows
- Webhooks
- Session state

## Skill Metadata

- **Version:** 1.0.0
- **Author:** Zoom
- **Required Tools:** Bash, Read, Write, Glob, Grep, Task
