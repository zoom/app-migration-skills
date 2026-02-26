# Slack to Zoom Team Chat Migration Skill

Intelligently migrate Slack apps to Zoom Team Chat with automated API mapping, code generation, and comprehensive documentation.

## Overview

This skill analyzes your Slack app and generates a production-ready Zoom Team Chat app with:

- ✅ **Complete TypeScript/Node.js codebase** - Ready to deploy
- ✅ **Intelligent API mapping** - Slack APIs → Zoom equivalents
- ✅ **Feature parity analysis** - Know exactly what works (typically 70-90%)
- ✅ **Comprehensive documentation** - Setup guides and migration reports
- ✅ **Zoom-specific optimizations** - All required adaptations applied
- ✅ **Pattern recognition** - Enhanced results for recognized app structures

## Core Capabilities

This skill provides comprehensive migration capabilities:

- 🔍 **Analyze Slack app code structure** - Understand your app's architecture, framework, and features
- 🗺️ **Map Slack APIs to Zoom equivalents** - Intelligent API translation with feasibility analysis
- 💻 **Generate production-ready Zoom chatbot code** - Complete TypeScript/Node.js project with tests
- 📚 **Create migration documentation** - Setup guides, API mappings, and deployment instructions
- 📊 **Calculate feature parity percentage** - Know exactly what works (typically 70-90%)
- ⚠️ **Identify impossible migrations** - Detect passive listening, complex modals, and unsupported features

## For Reviewers & Contributors

**New to this skill? Start here:**

1. **[SKILL.md](SKILL.md)** - High-level overview and implementation instructions
2. **[core/executor.md](core/executor.md)** - Detailed 6-phase execution flow with critical guidelines
3. **[core/instructions.md](core/instructions.md)** - Technical implementation details
4. **[commands/slack-to-zoom-migrate.md](commands/slack-to-zoom-migrate.md)** - Command definition and user documentation

**Key files to understand:**
- Entry point: `commands/slack-to-zoom-migrate.md` (defines `/slack-to-zoom-migrate` command)
- Execution logic: `core/executor.md` → `core/instructions.md`
- Base templates: `templates/general/` (TypeScript project foundation)
- Working example: `examples/poker-planner-zoom/` (real migrated app)
- API reference: `docs/API_MAPPING_REFERENCE.md` (complete Slack↔Zoom mappings)

### Execution Flow (What Claude Does)

When a user invokes `/slack-to-zoom-migrate <github-url-or-path>`, here's what happens:

```
1. Command Invocation
   └─> User types: /slack-to-zoom-migrate https://github.com/user/slack-app
   └─> Skill tool loads: commands/slack-to-zoom-migrate.md
   └─> Claude reads: SKILL.md → core/executor.md → core/instructions.md

2. Phase 1: Repository Analysis (30-45s)
   └─> Clone/read Slack app source code
   └─> Identify framework (Bolt.js, Express, Flask, etc.)
   └─> Catalog features (slash commands, buttons, events, modals)
   └─> Detect app patterns for optimization

3. Phase 2: Feature Mapping (30-45s)
   └─> Map each Slack API to Zoom equivalent using docs/API_MAPPING_REFERENCE.md
   └─> Calculate feature parity percentage (70-90% typical)
   └─> Identify unsupported features (passive listening, complex modals)
   └─> Document workarounds and limitations

4. Phase 3: Code Generation (60-90s)
   └─> Copy base template from templates/general/
   └─> Generate app-specific business logic
   └─> Implement Slack-to-Zoom API translations
   └─> Apply critical fixes:
       • Single asterisk for bold (*text* not **text**)
       • Store userName to display names (not user IDs)
       • Add is_markdown_support: true flag
       • Fire-and-forget webhook pattern
       • Auto-detect dev vs production credentials

5. Phase 4: Documentation (30-45s)
   └─> Generate README.md (setup guide)
   └─> Create MIGRATION_GUIDE.md (feature analysis)
   └─> Generate SETUP_CHECKLIST.md (Zoom Marketplace config)
   └─> Create .env.example (configuration template)

6. Phase 5: Validation (MANDATORY)
   └─> npm install dependencies
   └─> npm test (run unit tests with mocks)
   └─> TypeScript compilation check
   └─> Ask user: "Test with real Zoom credentials now?"
       • If YES: Create .env, wait for credentials, run live tests
       • If NO: Skip live testing (user tests manually later)
   └─> Auto-fix common bugs if found (see reference/COMMON_BUGS.md)
   └─> Re-validate after fixes

7. Phase 6: Final Summary (5-10s)
   └─> Display comprehensive validation report (11-point checklist)
   └─> Show feature parity percentage
   └─> List any manual steps required
   └─> Provide next steps (deployment, testing)
```

**Total time:** ~3-5 minutes per migration

## Usage

```bash
/slack-to-zoom-migrate <github-url-or-path>
```

**Examples:**
```bash
# Migrate from GitHub
/slack-to-zoom-migrate https://github.com/user/my-slack-bot

# Migrate from local directory
/slack-to-zoom-migrate ./my-slack-app

# Works with various frameworks
/slack-to-zoom-migrate https://github.com/user/bolt-python-app
/slack-to-zoom-migrate https://github.com/user/slack-sdk-app
```

## Quick Links

### 📚 Getting Started
- **[Quick Reference](reference/QUICK_REFERENCE.md)** - One-page API mapping cheatsheet
- **[FAQ](reference/FAQ.md)** - Common questions and answers
- **[Core Instructions](core/instructions.md)** - Technical implementation guide

### 🐛 Debugging & Reference
- **[Common Bugs](reference/COMMON_BUGS.md)** - Bug catalog with auto-fixes (8 bugs)
- **[Validation Examples](reference/VALIDATION_EXAMPLES.md)** - Expected output templates
- **[Changelog](changelog/CHANGELOG.md)** - Version history and improvements

### 📖 Documentation
- **[API Mapping Reference](docs/API_MAPPING_REFERENCE.md)** - Complete Slack↔Zoom mappings
- **[Code Examples](docs/code-examples/)** - Working code samples
- **[Zoom API Directory](docs/ZOOM_OFFICIAL_DOCS.md)** - All Zoom API links (40+)
- **[Slack API Directory](docs/SLACK_DOCS_DIRECTORY.md)** - All Slack API links (70+)

### 🔧 Advanced
- **[Templates](templates/)** - Code generation templates
- **[Examples](examples/)** - Real migration examples
- **[Executor](core/executor.md)** - Demo-worthy execution flow

---

## Migration Process

### Phase 1: Analysis
1. Clone or read the Slack app source code
2. Identify framework (Bolt, Express, Flask, etc.)
3. Catalog features (commands, events, buttons, modals)
4. Detect app patterns for optimization (internal)
5. Analyze Slack API usage patterns

### Phase 2: Mapping
Map Slack features to Zoom equivalents:

| Slack Feature | Zoom Equivalent | Feasibility |
|---------------|----------------|-------------|
| Slash commands | bot_notification event | ✅ 100% |
| Interactive buttons | interactive_message_actions | ✅ 100% |
| Block Kit messages | Message cards with markdown | ✅ 90% |
| Modals | ⚠️ Limited (iframe-based, unreliable) | ⚠️ 30% |
| Passive listening | ❌ Impossible (only @mentions) | ❌ 0% |
| App Home | ❌ Not available | ❌ 0% |
| OAuth | Client credentials flow | ✅ 100% |
| Webhooks | HMAC SHA256 validation | ✅ 100% |

### Phase 3: Code Generation
1. Copy Zoom boilerplate from templates
2. Generate session/state management
3. Create webhook handlers
4. Implement messaging with markdown support
5. Add OAuth and token management
6. Apply Zoom-specific fixes:
   - `is_markdown_support: true` flag
   - Fire-and-forget webhook pattern
   - `client_credentials` grant type
   - No `style` properties in messages
   - **Auto-detect dev vs production credentials** - Automatically configure API endpoints based on Bot JID format:
     - `@xmpp.zoom.us` → Production: `https://api.zoom.us`, `https://zoom.us`
     - `@xmppdev.zoom.us` → Development: `https://zoomdev.us`, `https://zoomdev.us`

### Phase 4: Documentation
Generate comprehensive migration guide:
- Feature parity analysis
- Setup instructions
- API mapping reference
- Known limitations
- Manual steps (if any)

### Phase 5: Deep Validation & Auto-Fixing ⚡ NEW
Thoroughly test and auto-fix issues before claiming "100% working":

1. **Basic Validation**
   - npm install
   - TypeScript compilation
   - npm test (unit tests)
   - Server startup
   - Health endpoint check

2. **Deep Webhook Testing**
   - Test slash command webhook with simulated payload
   - Test interactive actions webhook
   - Verify both respond correctly

3. **Server Log Analysis**
   - Capture logs during webhook tests
   - Detect critical errors:
     - ❌ "Invalid request body format" (duplicate body field)
     - ❌ "not initialized" (unprotected service calls)
     - ❌ Missing markdown support flags

4. **Automatic Bug Fixing**
   - Fix duplicate body field in message payloads
   - Wrap optional service calls in try-catch
   - Add missing `is_markdown_support` flags
   - Re-validate after each fix

5. **Comprehensive Report**
   - Show 11-point validation checklist
   - Display auto-fixes applied (if any)
   - **Only claim "100% ready" if all tests pass**

**Common Bugs Auto-Fixed:**
- ✅ Duplicate `body` and `content.body` fields (API error 7001)
- ✅ Uninitialized optional services crashing handlers
- ✅ Missing markdown support flags
- ✅ Fire-and-forget webhook pattern issues

See [reference/COMMON_BUGS.md](reference/COMMON_BUGS.md) for complete list.

---

## 📚 Documentation

### API Mapping Reference
- **[Complete API Mapping Guide](docs/API_MAPPING_REFERENCE.md)** - Master reference for all Slack-to-Zoom API mappings
- **[Zoom Documentation Directory](docs/ZOOM_OFFICIAL_DOCS.md)** - All Zoom API links organized by category (40+ links)
- **[Slack Documentation Directory](docs/SLACK_DOCS_DIRECTORY.md)** - All Slack API links organized by category (70+ links)

### Category-Specific Guides
- [Messaging API](docs/api-mapping/messaging-api.md) - Send, update, delete messages
- [Events & Webhooks](docs/api-mapping/events-webhooks.md) - Event handling comparison
- [Interactive Components](docs/api-mapping/interactivity.md) - Buttons, modals, UI elements
- [OAuth & Authentication](docs/api-mapping/oauth-auth.md) - Authentication flows
- [Slash Commands](docs/api-mapping/slash-commands.md) - Command implementation
- [Message Formatting](docs/api-mapping/formatting.md) - Block Kit to Markdown

### Code Examples
- [Send Message](docs/code-examples/send-message.md) - Slack vs Zoom message sending
- [Update Message](docs/code-examples/update-message.md) - Editing messages
- [Button Handling](docs/code-examples/button-handling.md) - Interactive button clicks
- [OAuth Flow](docs/code-examples/oauth-flow.md) - Authentication comparison
- [Webhook Validation](docs/code-examples/webhook-validation.md) - Security validation
- [Markdown Conversion](docs/code-examples/markdown-conversion.md) - Block Kit → Markdown
- [Slash Commands](docs/code-examples/slash-commands.md) - Command handling
- [Error Handling](docs/code-examples/error-handling.md) - Error patterns

### Quick Links
- [Zoom Team Chat API](https://developers.zoom.us/docs/api/team-chat/) - Official Zoom API docs
- [Zoom Chatbot Webhooks](https://developers.zoom.us/docs/team-chat-apps/chatbot-webhooks/) - Webhook events
- [Zoom Markdown Support](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/) - Formatting guide
- [Slack API Documentation](https://api.slack.com/) - Official Slack API docs
- [Slack Block Kit](https://api.slack.com/block-kit) - UI framework

---

## Templates

The skill uses intelligent templates based on app analysis:

### General Template (Default)
Location: `templates/general/`

Foundation for all migrations:
- Express server with TypeScript
- OAuth flow (client credentials)
- Webhook validation (HMAC SHA256)
- Token management with auto-refresh
- Message sending with markdown support
- Interactive button handlers
- Configurable for various app types

### Optimized Templates (Auto-Selected)
Location: `templates/[pattern]/`

When specific app patterns are detected, the skill uses optimized templates with:
- Pre-built feature implementations
- Enhanced parity (85-90% vs 70-80%)
- Fewer manual fixes required
- Production-ready code

**Note:** Pattern detection happens automatically during analysis.

## Output Structure

```
<output-directory>/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md (setup guide)
├── MIGRATION_GUIDE.md (feature parity analysis)
├── src/
│   ├── server.ts
│   ├── config.ts
│   ├── types/
│   │   └── index.ts
│   ├── zoom/
│   │   ├── auth.ts
│   │   ├── tokens.ts
│   │   ├── webhook.ts
│   │   └── messaging.ts
│   └── [app-specific]/
│       ├── storage.ts
│       └── controller.ts
```

## Known Limitations

### Cannot Migrate
- Apps requiring passive message listening (Archive Bot, auto-moderation)
- Complex modal workflows (multi-step forms)
- App Home tabs
- Rich text formatting (colors, custom fonts)

### Partial Migration
- Simple modals → Inline message cards
- File uploads → Basic file handling
- Rich formatting → Markdown approximation

### Full Migration
- Slash commands
- Interactive buttons
- Simple messages
- Session state
- OAuth flows
- Webhooks

## Expected Results

Results vary by app complexity and Slack features used:

### High Compatibility (85-90% parity)
- **Command-driven apps** with buttons and simple state
- **Voting/polling apps** with interactive features
- **Workflow bots** with slash commands and responses
- **Typically:** 0-2 manual fixes needed

### Good Compatibility (70-85% parity)
- **Standard bots** with message sending and basic state
- **Notification apps** with scheduled messages
- **Integration bots** with external API calls
- **Typically:** 2-5 manual fixes needed

### Limited Compatibility (40-70% parity)
- **Modal-heavy apps** requiring UI redesign
- **Complex workflows** with multi-step forms
- **Apps with advanced Block Kit** layouts
- **Typically:** 5-10 manual fixes + UI work

### Poor Compatibility (<40% parity)
- **Passive listening apps** (architecture change required)
- **App Home heavy** apps (feature not available)
- **Custom formatting** apps (markdown limitations)
- **Typically:** Major rewrite recommended

## Validation Guarantees

When this skill claims **"100% PRODUCTION READY ✅"**, it means:

### ✅ Verified Working
- TypeScript compiles with 0 errors
- All dependencies installed successfully
- Server starts on port 3000
- Health endpoint responds (HTTP 200)
- OAuth endpoint configured correctly
- Webhooks respond to slash commands
- Webhooks respond to button actions
- Server logs show no critical errors
- Message format is API-compliant
- Optional integrations skip gracefully

### 🔧 Auto-Fixed If Needed
- Duplicate body field in messages (API error 7001)
- Uninitialized service crashes
- Missing markdown support flags
- Incorrect OAuth grant types
- Fire-and-forget webhook patterns

### 📊 Validation Report Format
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ COMPREHENSIVE VALIDATION COMPLETE

TypeScript Compilation:     ✅ PASS (0 errors)
Dependencies:               ✅ PASS (154 packages)
Unit Tests:                 ✅ PASS (13/13 tests)
[... 11 total checks ...]

Auto-Fixes Applied:         2
  🔧 Fixed: Duplicate body field in messaging.ts
  🔧 Fixed: Uninitialized service in controller

Result: 11/11 validations passed ✓

╔════════════════════════════════════════╗
║  STATUS: 100% PRODUCTION READY ✅      ║
╚════════════════════════════════════════╝
```

### ⚠️ When NOT Claiming 100%

If any validation fails, the skill will report:
- **"PARTIALLY WORKING ⚠️"** - Some features work, manual fixes needed
- **"NOT WORKING ❌"** - Critical errors, significant work required

The skill will NEVER claim 100% if:
- TypeScript won't compile
- Server won't start
- Webhooks don't respond
- Critical errors in logs
- Auto-fixes unsuccessful after 3 attempts

See [reference/VALIDATION_EXAMPLES.md](reference/VALIDATION_EXAMPLES.md) for detailed examples.

---

## Developer Notes

### Critical Zoom Quirks
1. **Markdown support**: Must add `is_markdown_support: true` at message root
2. **Webhook async**: Use fire-and-forget pattern to avoid "headers already sent" error
3. **OAuth**: Use `client_credentials` grant type, not `account_credentials`
4. **Message style**: No `style` property, use markdown syntax only
5. **Bot mentions**: Bots only receive @mentions, not passive channel messages

### Testing Checklist
- [ ] OAuth flow completes successfully
- [ ] Webhook validation passes
- [ ] Slash command triggers bot_notification
- [ ] Buttons trigger interactive_message_actions
- [ ] Messages display markdown correctly
- [ ] Token refresh works automatically
- [ ] Database/storage persists sessions
- [ ] Error handling works

## Real-World Examples

### Command-Driven Voting App
```
Input: Slack voting bot with /poll command
Analysis:
  - Framework: Bolt.js
  - Features: Slash commands, buttons, vote storage
  - Pattern: Interactive command-response
Output:
  - Feature parity: 85%
  - Setup time: ~10 minutes
  - Manual fixes: 1 (adjust vote display formatting)
Result: ✅ Production-ready
```

### Reminder/Scheduling Bot
```
Input: Slack reminder bot with time-based notifications
Analysis:
  - Framework: Python + Slack SDK
  - Features: /remind command, scheduled messages, persistence
  - Pattern: Command-driven with state
Output:
  - Feature parity: 75%
  - Setup time: ~20 minutes
  - Manual fixes: 3 (scheduler integration, time parsing, notifications)
Result: ✅ Works with minor fixes
```

### Archive/Monitoring Bot
```
Input: Bot that archives all channel messages
Analysis:
  - Framework: Custom Express app
  - Features: Passive listening, message.* events, database
  - Pattern: Event-driven passive monitoring
Output:
  - Feature parity: 35%
  - Setup time: N/A
  - Required changes: Switch to @mention-based or compliance API
Result: ⚠️ Architectural redesign required
```
