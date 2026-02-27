# Slack to Zoom Migration Skill Instructions

When this skill is invoked, follow these steps systematically to migrate a Slack app to Zoom Team Chat.

## ✅ Execution Flow: All 6 Phases

**Complete all phases in order for best results.**

### Required Phases (from executor.md):
1. ✅ Phase 1: Repository Analysis (30-45s)
2. ✅ Phase 2: Feature Mapping (30-45s)
3. ✅ Phase 3: Code Generation (60-90s)
4. ✅ Phase 4: Documentation (30-45s)
5. ✅ **Phase 5: Code Validation (Always run npm test, optionally test with credentials)**
6. ✅ Phase 6: Final Summary (5-10s)

**CHECKPOINT AFTER PHASE 4:**
Before proceeding to Phase 6, verify Phase 5 is complete:
- [ ] Ran npm install?
- [ ] Ran npm test (with mocks)?
- [ ] Verified TypeScript compiles?
- [ ] Asked user if they want credential testing?

**All core validation should be complete.**

## ⚠️ IMPORTANT: Demo-Worthy Execution

**For user-facing execution, follow `executor.md` which provides a demo-worthy 2-3 minute experience with:**
- Progressive analysis with visual feedback
- Step-by-step explanations of decisions
- Simulated intelligent code generation
- Feature parity calculations shown live
- Professional progress indicators
- **Flexible credential testing (optional but thorough)**

**This document provides the technical implementation details.**

---

## Step 0: Initialize Environment

### Determine Skill Directory

The skill needs to know where its templates are located. Use this pattern:

```bash
# The skill base directory is provided in the system message
# Look for: "Base directory for this skill: /path/to/skill"

# Store it for use throughout
SKILL_DIR="<path-from-system-message>"

# Verify it exists
if [ ! -d "$SKILL_DIR/templates" ]; then
  echo "❌ Error: Skill templates not found"
  echo "Expected: $SKILL_DIR/templates"
  echo "This indicates the skill was not properly installed."
  exit 1
fi

echo "✅ Skill directory: $SKILL_DIR"
```

### Get Current Working Directory

```bash
WORK_DIR=$(pwd)
echo "📁 Working directory: $WORK_DIR"
```

## Step 1: Parse Arguments

Extract the GitHub URL or local path from the user's command:
```
/slack-to-zoom-migrate <url-or-path>
```

Examples:
- `https://github.com/dgurkaynak/slack-poker-planner`
- `./my-slack-app`
- `https://github.com/user/repo`

**Parse and validate:**
```bash
INPUT="$1"

if [ -z "$INPUT" ]; then
  echo "❌ Error: No repository URL or path provided"
  echo "Usage: /slack-to-zoom-migrate <github-url-or-path>"
  exit 1
fi

# Determine if it's a URL or local path
if [[ "$INPUT" =~ ^https?:// ]]; then
  GITHUB_URL="$INPUT"
  echo "📥 Repository: $GITHUB_URL"
elif [ -d "$INPUT" ]; then
  LOCAL_PATH="$INPUT"
  echo "📁 Local path: $LOCAL_PATH"
else
  echo "❌ Error: Invalid input - not a URL or existing directory"
  exit 1
fi
```

## Step 2: Fetch/Read Source Code

### If GitHub URL:
1. Clone the repository to a temporary directory with error handling:
   ```bash
   TEMP_DIR="/tmp/slack-migration-$(date +%s)"
   git clone "$GITHUB_URL" "$TEMP_DIR" 2>&1 || {
     echo "❌ Failed to clone repository: $GITHUB_URL"
     exit 1
   }

   # Verify clone succeeded
   if [ ! -d "$TEMP_DIR/.git" ]; then
     echo "❌ Repository clone incomplete"
     exit 1
   fi
   ```

### If local path:
1. Verify the path exists
2. Use the path directly for analysis

## Step 3: Analyze App Type

Use the Explore agent to analyze the codebase:

1. **Identify app framework**:
   - Bolt for JavaScript/Python
   - Slack SDK
   - Custom Express/Flask app

2. **Find key files**:
   - Entry point (app.js, index.js, main.py, etc.)
   - Slack event handlers
   - Slash command definitions
   - Database/storage layer

3. **Catalog features**:
   - Slash commands used
   - Interactive components (buttons, selects, modals)
   - Event subscriptions
   - OAuth requirements
   - Database/storage patterns

4. **Check if Poker Planner**:
   - Look for poker planning patterns
   - Check repo URL contains "poker" or "planner"
   - Verify it matches Slack Poker Planner structure

## Step 4: Choose Template

Use the general template from `templates/general/` and adapt based on app features detected

## Step 5: Generate Zoom App

1. **Copy general template**:
   ```bash
   cp -r templates/general/* <output-directory>/
   ```

2. **Generate webhook handlers** based on Slack patterns:

   **Slack slash command** → **Zoom bot_notification**:
   ```typescript
   if (body.event === 'bot_notification') {
     const { cmd, userJid, userName, toJid, accountId } = body.payload;
     // Handle command logic
   }
   ```

   **Slack button click** → **Zoom interactive_message_actions**:
   ```typescript
   if (body.event === 'interactive_message_actions') {
     const { actionItem, userJid, userName } = body.payload;
     const action = JSON.parse(actionItem.value);
     // Handle button action
   }
   ```

3. **Generate messaging functions**:
   ```typescript
   export async function sendMessage(toJid: string, text: string) {
     const messageBody = {
       robot_jid: config.zoom.botJid,
       to_jid: toJid,
       account_id: accountId,
       user_jid: userJid,
       is_markdown_support: true,  // CRITICAL!
       content: {
         head: { text: 'App Name' },
         body: [{
           type: 'message',
           text: text
         }]
       }
     };

     await axios.post(
       `${config.zoom.apiHost}/v2/im/chat/messages`,
       messageBody,
       { headers: { Authorization: `Bearer ${botToken}` } }
     );
   }
   ```

4. **Generate token management**:
   ```typescript
   export async function getBotToken(): Promise<string> {
     if (cachedToken && cachedToken.expiresAt > Date.now()) {
       return cachedToken.token;
     }

     const authHeader = Buffer.from(
       `${config.zoom.clientId}:${config.zoom.clientSecret}`
     ).toString('base64');

     const response = await axios.post(
       `${config.zoom.oauthHost}/oauth/token?grant_type=client_credentials`,
       {},
       { headers: { Authorization: `Basic ${authHeader}` } }
     );

     cachedToken = {
       token: response.data.access_token,
       expiresAt: Date.now() + (response.data.expires_in - 300) * 1000
     };

     return cachedToken.token;
   }
   ```

5. **Migrate state management**:
   - If Slack app uses Redis → Keep Redis or switch to SQLite
   - If Slack app uses MongoDB → Keep MongoDB
   - If Slack app uses in-memory → Add SQLite for persistence

6. **Convert UI components**:
   - Slack Block Kit → Zoom message cards with markdown
   - Modals → Inline message cards (warn user about limitations)
   - Rich formatting → Markdown approximation

7. **Generate MIGRATION_GUIDE.md**:
   - Feature parity percentage (calculate based on analysis)
   - Working features list
   - Limitations and missing features
   - Manual steps required (if any)
   - Known issues to fix

## Step 6: Apply Critical Fixes

Apply these Zoom-specific fixes to all generated code:

1. **Markdown support flag**:
   - Add `is_markdown_support: true` to all message bodies

2. **user_jid field (CRITICAL)**:
   - **ALWAYS** include `user_jid` parameter in MessageBuilder functions
   - **ALWAYS** include `user_jid: userJid` in message return objects
   - Example:
   ```typescript
   static buildNominationMessage(
     toJid: string,
     userJid: string,  // ✅ Required parameter
     nominator: string
   ): ZoomMessage {
     return {
       to_jid: toJid,
       user_jid: userJid,  // ✅ Required field
       is_markdown_support: true,
       body: [...]
     };
   }
   ```

3. **HTTP timeout (CRITICAL)**:
   - **ALWAYS** use the shared `httpClient` from `./http-client` instead of raw `axios`
   - The httpClient has a 15-second timeout to prevent hanging on unresponsive APIs
   - Example:
   ```typescript
   // ❌ Wrong (no timeout, hangs indefinitely)
   import axios from 'axios';
   const response = await axios.post(url, data);

   // ✅ Correct (15s timeout)
   import { httpClient } from './http-client';
   const response = await httpClient.post(url, data);
   ```

4. **Fire-and-forget webhooks**:
   ```typescript
   // ❌ Wrong (causes "headers already sent" error)
   await handleCommand(...);
   res.json({ success: true });

   // ✅ Correct
   res.json({ success: true });
   handleCommand(...).catch(console.error);
   ```

5. **OAuth grant type**:
   - Use `client_credentials` not `account_credentials`

6. **No style properties**:
   - Remove any `style: 'italic'`, `style: 'bold'` properties
   - Use markdown syntax instead: `*bold*`, `_italic_`

7. **Button styles (CRITICAL)**:
   - **Slack uses lowercase**: `'primary'`, `'danger'`, `'default'`
   - **Zoom requires capitalized**: `'Primary'`, `'Danger'`, `'Default'`
   - TypeScript interface must also use capitalized values:
   ```typescript
   export interface InteractiveButton {
     action_id: string;
     value: string;
     text: string;
     style?: 'Primary' | 'Danger' | 'Default';  // ✅ Capitalized
   }
   ```

8. **Button value format**:
   ```typescript
   {
     text: 'Button Text',
     value: JSON.stringify({ action: 'do_something', data: 'value' }),
     style: 'Primary'  // ✅ Capitalized: 'Primary', 'Default', or 'Danger'
   }
   ```

9. **Button actions must use channel ID from webhook (CRITICAL)**:
   - Extract `toJid` from webhook payload when handling button clicks
   - Pass it as `channelId` to button action handlers
   - Use it when sending new messages (not `userJid`)
   - This prevents "Restart" and similar actions from posting to DMs
   ```typescript
   // ✅ Correct webhook handler
   if (body.event === 'interactive_message_actions') {
     const { userJid, userName, accountId, actionItem, toJid } = body.payload;
     handleButtonAction({
       userJid,
       userName,
       accountId,
       channelId: toJid,  // ← Extract from webhook
       actionValue: actionItem.value,
     });
   }
   ```
   - See [COMMON_FIXES.md](../docs/COMMON_FIXES.md) for detailed examples

10. **Consider disabling auto-reveal for voting apps**:
   - Original Slack Poker Planner had auto-reveal when all participants voted
   - Many users prefer manual reveal for better control
   - Remove auto-reveal logic if not explicitly requested:
   ```typescript
   // ❌ Auto-reveal (may not be desired)
   if (allVoted) {
     session.state = 'revealed';
     await updateMessage(...);
   }

   // ✅ Manual reveal only
   await updateMessage(...);  // Just update vote count
   // User clicks "Reveal" button when ready
   ```

## Step 7: Generate Documentation

Create comprehensive docs in the output directory:

### README.md
```markdown
# [App Name] for Zoom Team Chat

Migrated from Slack app: [original repo]

## Features
[List all features that work]

## Setup
[Step-by-step Zoom Marketplace configuration]

## Usage
[Command examples]

## Deployment
[Deployment instructions]
```

### MIGRATION_GUIDE.md
```markdown
# Migration Guide: Slack to Zoom

## Feature Parity: [X]%

### Working Features ✅
- Feature 1
- Feature 2

### Limited Features ⚠️
- Feature X (modal → inline card)

### Not Available ❌
- Feature Y (requires passive listening)

### Manual Steps Required
[List any manual fixes needed]

### Known Issues
[Any bugs or limitations]
```

### SETUP_CHECKLIST.md
```markdown
# Zoom Marketplace Setup Checklist

## 1. Create Zoom App
- [ ] Go to marketplace.zoom.us
- [ ] Click Develop → Build App → Team Chat App
- [ ] Enter app name: [name]

## 2. Configure App
- [ ] Add slash command: /[command]
- [ ] Add scopes: imchat:bot
- [ ] Set bot endpoint: https://your-domain/webhooks/zoom
- [ ] Enable events: bot_notification, interactive_message_actions

## 3. Get Credentials
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Copy Bot JID
- [ ] Copy Webhook Secret Token

## 4. Deploy
- [ ] Update .env with credentials
- [ ] Run npm install
- [ ] Run npm start
- [ ] Test /[command] in Zoom channel
```

## Step 8: Output Summary

Provide the user with:

1. **Location of generated code**
2. **Feature parity percentage**
3. **Setup time estimate** (based on complexity)
4. **Manual fixes required** (if any)
5. **Next steps** (follow SETUP_CHECKLIST.md)

### Example Output:

```
✅ Slack Poker Planner migrated successfully!

📁 Output: /Users/you/poker-planner-zoom/
📊 Feature Parity: 90%
⏱️ Setup Time: ~10 minutes
🔧 Manual Fixes: 0

✨ Special features included:
  ✅ Custom point values
  ✅ Calculate average
  ✅ Restart voting
  ✅ Auto-reveal timer

📝 Next steps:
  1. Follow SETUP_CHECKLIST.md to configure Zoom Marketplace
  2. Update .env with your credentials
  3. Run: npm install && npm run dev
  4. Test with: /pp Test session

The generated app is 100% working and production-ready! 🚀
```

## Error Handling

### If GitHub repo is private/inaccessible:
- Inform user repo is private
- Ask if they can provide local path or make repo public

### If app uses unsupported features:
- Generate best-effort migration
- Document limitations clearly
- Suggest architecture changes

### If app is too complex:
- Analyze core features
- Generate partial migration for supported features
- Provide detailed guide for manual implementation

## ✅ Phase 5: Code Validation (Flexible Approach)

**Always validate code quality, optionally test with credentials.**

After Phase 4 (Documentation) completes, follow this two-step approach:

### Step 5.0: Core Validation (ALWAYS RUN - REQUIRED)

**These validations are mandatory and work without credentials:**

```bash
cd <output-dir>

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Run tests with mocks
echo "🧪 Running tests..."
npm test

# 3. Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Core validation complete!"
```

**Display results:**
```
✅ Dependencies installed: X packages
✅ Tests passed: Y/Y (with mocks)
✅ TypeScript compiled successfully
```

### Step 5.1: Ask User About Credential Testing (ALWAYS ASK - REQUIRED)

**IMPORTANT:** You MUST ask this question after core validation passes. Do not skip.

Ask if user wants to test with real credentials:

```typescript
{
  "questions": [{
    "question": "Core validation passed! Test with real Zoom credentials now?",
    "header": "Credentials",
    "multiSelect": false,
    "options": [
      {
        "label": "Yes - Test with my credentials",
        "description": "Create .env file, I'll paste credentials for live API testing"
      },
      {
        "label": "No - Skip live testing",
        "description": "Code is validated, I'll test manually when ready"
      }
    ]
  }]
}
```

### Step 5.2: If User Says YES (Optional Path)

1. **Create .env file with placeholders**
   ```bash
   cp .env.example .env
   echo "✅ Created .env file at: <output-dir>/.env"
   ```

2. **Ask user to fill credentials**
   ```
   📝 Please edit the .env file and paste your credentials.

   Required values:
   - ZOOM_CLIENT_ID
   - ZOOM_CLIENT_SECRET
   - ZOOM_BOT_JID (format: username_bot@xmpp.zoom.us)
   - ZOOM_WEBHOOK_SECRET_TOKEN
   ```

3. **Wait for confirmation**
   ```typescript
   {
     "questions": [{
       "question": "Have you pasted your credentials?",
       "header": "Ready",
       "options": [
         {"label": "Done - Credentials added", "description": "Ready to test"},
         {"label": "Skip - Test later", "description": "I'll test manually"}
       ]
     }]
   }
   ```

4. **If "Done" selected, run live tests:**
   - Verify .env file has real values (not placeholders)
   - Start server and test webhook endpoints
   - Display live validation results

### Step 5.3: If User Says NO (Skip Path)

Simply proceed to Phase 6 with core validation results.

Display message:
```
✅ Core validation complete!
⏭️  Skipping live credential testing (user choice)
📝 User can test manually by following SETUP_CHECKLIST.md
```

## VALIDATION REQUIREMENTS

**ALWAYS REQUIRED (regardless of credential choice):**
- ✅ npm install
- ✅ npm test (with mocks)
- ✅ TypeScript build

**OPTIONAL (only if user provides credentials):**
- ⚠️ Live API testing
- ⚠️ Webhook endpoint testing
- ⚠️ OAuth flow testing

## CHECKPOINT: Before Phase 6 Final Summary

**Verify Phase 5 core validation is complete:**

```
PHASE 5 VALIDATION CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS REQUIRED (do not skip):
[ ] Ran npm install?
[ ] Ran npm test (with mocks)?
[ ] Built TypeScript successfully?
[ ] Asked user: "Test with credentials?" (YES/NO)

CONDITIONALLY REQUIRED (only if user said YES):
[ ] Created .env file?
[ ] Asked user: "Done adding credentials?"
[ ] Ran live tests (if they said "Done")?

You MUST always ask the credential question.
Whether you run live tests depends on their answer.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5.3: Webhook Integration Testing (MANDATORY)

Test all webhook endpoints with simulated payloads to catch bugs:

```bash
# Test 1: Slash command webhook
echo "Testing slash command webhook..."
RESPONSE=$(curl -s -X POST http://localhost:3000/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "bot_notification",
    "payload": {
      "userJid": "test_user@xmppdev.zoom.us",
      "userName": "Test User",
      "cmd": "test argument",
      "accountId": "test_account",
      "toJid": "test_channel@conference.xmppdev.zoom.us"
    }
  }')

if [[ "$RESPONSE" == *"success"* ]]; then
  echo "✅ Slash command webhook responds"
else
  echo "❌ Slash command webhook failed: $RESPONSE"
fi

# Test 2: Button click webhook
echo "Testing interactive actions webhook..."
RESPONSE=$(curl -s -X POST http://localhost:3000/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "interactive_message_actions",
    "payload": {
      "userJid": "test_user@xmppdev.zoom.us",
      "userName": "Test User",
      "accountId": "test_account",
      "toJid": "test_channel@conference.xmppdev.zoom.us",
      "actionItem": {
        "value": "{\"action\":\"test\",\"data\":\"value\"}",
        "action_id": "test_action"
      }
    }
  }')

if [[ "$RESPONSE" == *"success"* ]]; then
  echo "✅ Interactive actions webhook responds"
else
  echo "❌ Interactive actions webhook failed: $RESPONSE"
fi

# Test 3: OAuth endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/zoomapp/auth)
if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ]; then
  echo "✅ OAuth endpoint responds"
else
  echo "❌ OAuth endpoint failed (HTTP $RESPONSE)"
fi
```

### Step 5.4: Server Log Analysis (MANDATORY)

Capture server logs during webhook testing and analyze for errors:

```bash
# Capture logs
LOGS=$(tail -100 /tmp/server-validation.log)

# Check for critical errors
if echo "$LOGS" | grep -q "Invalid request body format"; then
  echo "❌ CRITICAL: Duplicate body field detected in message payload"
  echo "   Fix: Check messaging.ts sendMessage() function"
  echo "   Issue: Spreading payload creates both 'body' and 'content.body'"
  FIX_NEEDED=true
fi

if echo "$LOGS" | grep -q "not initialized. Call initialize"; then
  echo "❌ CRITICAL: Optional service crashing instead of gracefully skipping"
  echo "   Fix: Wrap getService() calls in try-catch blocks"
  FIX_NEEDED=true
fi

if echo "$LOGS" | grep -q "EADDRINUSE"; then
  echo "⚠️  Port conflict detected, killing process..."
  lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null
  # Retry server start
fi

if echo "$LOGS" | grep -q "Cannot find module"; then
  echo "⚠️  Missing dependency detected, installing..."
  MODULE=$(echo "$LOGS" | grep "Cannot find module" | sed -n "s/.*Cannot find module '\(.*\)'.*/\1/p")
  npm install "$MODULE"
  # Retry server start
fi
```

### Step 5.5: Code Quality Checks (MANDATORY)

Verify generated code follows Zoom best practices:

```typescript
// Check 1: All messages have is_markdown_support: true
cd <output-dir>
FILES=$(find src -name "*.ts" -type f)

for FILE in $FILES; do
  # Check for message sending without markdown support
  if grep -q "content:" "$FILE" && ! grep -q "is_markdown_support" "$FILE"; then
    echo "⚠️  $FILE: Missing is_markdown_support flag"
  fi

  # Check for duplicate body/content fields
  if grep -q '...messagePayload' "$FILE" && grep -q 'content: {' "$FILE"; then
    echo "❌ CRITICAL: $FILE has duplicate body field bug"
    echo "   Line: $(grep -n '...messagePayload' "$FILE" | cut -d: -f1)"
    FIX_NEEDED=true
  fi

  # Check for unhandled service initialization
  if grep -q 'getGitHubService()' "$FILE" && grep -q 'getGitHubService()' "$FILE"; then
    # Check if it's wrapped in try-catch
    CONTEXT=$(grep -A 3 -B 3 'getGitHubService()' "$FILE")
    if ! echo "$CONTEXT" | grep -q 'try'; then
      echo "❌ CRITICAL: $FILE calls getGitHubService() without try-catch"
      FIX_NEEDED=true
    fi
  fi

  # Check for missing user_jid in MessageBuilder functions
  if [[ "$FILE" == *"MessageBuilder.ts" ]]; then
    # Check if build functions include user_jid parameter
    BUILD_FUNCS=$(grep -n "static build.*Message" "$FILE")
    while IFS= read -r line; do
      FUNC_LINE=$(echo "$line" | cut -d: -f1)
      # Get function signature (next 5 lines)
      SIGNATURE=$(sed -n "${FUNC_LINE},$((FUNC_LINE+5))p" "$FILE")

      if ! echo "$SIGNATURE" | grep -q "userJid.*string"; then
        FUNC_NAME=$(echo "$line" | sed -n 's/.*static \(build[^(]*\).*/\1/p')
        echo "❌ CRITICAL: $FILE $FUNC_NAME missing userJid parameter"
        echo "   Line: $FUNC_LINE"
        FIX_NEEDED=true
      fi

      # Check if return statement includes user_jid field
      RETURN_LINE=$(sed -n "${FUNC_LINE},/return {/=" "$FILE" | tail -1)
      RETURN_BLOCK=$(sed -n "${RETURN_LINE},$((RETURN_LINE+10))p" "$FILE")
      if ! echo "$RETURN_BLOCK" | grep -q "user_jid:"; then
        echo "❌ CRITICAL: $FILE $FUNC_NAME return missing user_jid field"
        FIX_NEEDED=true
      fi
    done <<< "$BUILD_FUNCS"
  fi

  # Check for lowercase button styles
  if grep -q "style: '[a-z]" "$FILE"; then
    echo "❌ CRITICAL: $FILE has lowercase button style"
    echo "   Found: $(grep -n "style: '[a-z]" "$FILE" | head -1)"
    echo "   Zoom requires capitalized: 'Primary', 'Danger', 'Default'"
    FIX_NEEDED=true
  fi
done
```

### Step 5.6: Auto-Fix Common Issues (MANDATORY)

When bugs are detected, automatically fix them:

```bash
if [ "$FIX_NEEDED" = true ]; then
  echo ""
  echo "🔧 Auto-fixing detected issues..."
  echo ""

  # Fix 1: Duplicate body field in messaging.ts
  if grep -q '...messagePayload' src/zoom/messaging.ts; then
    echo "Fixing duplicate body field in messaging.ts..."

    # Replace spread operator with explicit field mapping
    sed -i.bak 's/...messagePayload,/to_jid: messagePayload.to_jid,\n      user_jid: messagePayload.user_jid,\n      is_markdown_support: messagePayload.is_markdown_support !== false,/g' src/zoom/messaging.ts

    echo "✅ Fixed messaging.ts"
  fi

  # Fix 2: Unprotected getGitHubService() calls
  for FILE in src/app/*.ts; do
    if grep -q 'const github = getGitHubService();' "$FILE"; then
      echo "Fixing unprotected getGitHubService() in $FILE..."

      # Move getGitHubService() inside try-catch
      sed -i.bak '/const github = getGitHubService();/,/try {/s/const github = getGitHubService();\n.*try {/try {\n        const github = getGitHubService();/' "$FILE"

      echo "✅ Fixed $FILE"
    fi
  done

  # Fix 3: Missing is_markdown_support
  for FILE in src/**/*.ts; do
    if grep -q 'content: {' "$FILE" && ! grep -q 'is_markdown_support' "$FILE"; then
      echo "Adding is_markdown_support to $FILE..."

      sed -i.bak '/content: {/i\      is_markdown_support: true,' "$FILE"

      echo "✅ Fixed $FILE"
    fi
  done

  # Fix 4: Missing user_jid in MessageBuilder
  if [[ -f "src/app/MessageBuilder.ts" ]]; then
    echo "Fixing missing user_jid in MessageBuilder..."

    # Add userJid parameter to function signatures
    sed -i.bak 's/static build\([^(]*\)Message(\n\s*toJid: string,/static build\1Message(\n    toJid: string,\n    userJid: string,/g' src/app/MessageBuilder.ts

    # Add user_jid field to return statements
    sed -i.bak '/return {/,/to_jid: toJid/ s/to_jid: toJid,/to_jid: toJid,\n      user_jid: userJid,/' src/app/MessageBuilder.ts

    echo "✅ Fixed MessageBuilder.ts"
    FIX_COUNT=$((FIX_COUNT + 1))

    # Update controller to pass userJid
    for FILE in src/app/*Controller.ts; do
      if grep -q "MessageBuilder.build" "$FILE"; then
        echo "Updating $FILE to pass userJid..."

        # Add ctx.userJid after ctx.channelId in MessageBuilder calls
        sed -i.bak 's/MessageBuilder\.build\([^(]*\)(\n\s*ctx\.channelId,/MessageBuilder.build\1(\n      ctx.channelId,\n      ctx.userJid,/' "$FILE"

        echo "✅ Fixed $FILE"
        FIX_COUNT=$((FIX_COUNT + 1))
      fi
    done
  fi

  # Fix 5: Lowercase button styles
  echo "Fixing lowercase button styles..."

  find src -name "*.ts" -type f -exec sed -i.bak \
    -e "s/style: 'primary'/style: 'Primary'/g" \
    -e "s/style: 'danger'/style: 'Danger'/g" \
    -e "s/style: 'default'/style: 'Default'/g" {} \;

  # Fix TypeScript interface
  if [[ -f "src/app/MessageBuilder.ts" ]]; then
    sed -i.bak "s/'primary' | 'danger' | 'default'/'Primary' | 'Danger' | 'Default'/g" \
      src/app/MessageBuilder.ts
    echo "✅ Fixed button style types"
    FIX_COUNT=$((FIX_COUNT + 1))
  fi

  # Re-run validation after fixes
  echo ""
  echo "🔄 Re-running validation after fixes..."
  npm run dev > /tmp/server-validation-retry.log 2>&1 &
  sleep 5

  # Re-test webhooks
  # ... (repeat webhook tests)
fi
```

### Step 5.7: Real API Testing (If Credentials Provided)

If user provided credentials, test actual Zoom API calls:

```bash
if [ -n "$ZOOM_CLIENT_ID" ] && [ -n "$ZOOM_BOT_JID" ]; then
  echo ""
  echo "🔍 Testing real Zoom API integration..."

  # Test 1: Token generation
  TOKEN_RESPONSE=$(curl -s -X POST "$ZOOM_OAUTH_HOST/oauth/token?grant_type=client_credentials" \
    -H "Authorization: Basic $(echo -n "$ZOOM_CLIENT_ID:$ZOOM_CLIENT_SECRET" | base64)")

  if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    echo "✅ OAuth token generation works"
    TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
  else
    echo "❌ OAuth token generation failed"
    echo "   Response: $TOKEN_RESPONSE"
    return 1
  fi

  # Test 2: Send test message (if test channel provided)
  if [ -n "$TEST_CHANNEL_JID" ]; then
    echo "Sending test message to $TEST_CHANNEL_JID..."

    MSG_RESPONSE=$(curl -s -X POST "$ZOOM_API_HOST/v2/im/chat/messages" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"robot_jid\": \"$ZOOM_BOT_JID\",
        \"to_jid\": \"$TEST_CHANNEL_JID\",
        \"account_id\": \"$TEST_ACCOUNT_ID\",
        \"is_markdown_support\": true,
        \"content\": {
          \"head\": {\"text\": \"Test\"},
          \"body\": [{\"type\": \"message\", \"text\": \"✅ Bot validation successful!\"}]
        }
      }")

    if echo "$MSG_RESPONSE" | grep -q "message_id"; then
      echo "✅ Message sent successfully to Zoom"
      echo "   Message ID: $(echo "$MSG_RESPONSE" | jq -r '.message_id')"
    else
      echo "❌ Message send failed"
      echo "   Response: $MSG_RESPONSE"

      # Analyze error
      if echo "$MSG_RESPONSE" | grep -q "7001"; then
        echo "   ERROR: Invalid request body format (duplicate body field?)"
        FIX_NEEDED=true
      elif echo "$MSG_RESPONSE" | grep -q "7004"; then
        echo "   ERROR: Deactivated user/channel (expected with test accounts)"
      fi
    fi
  fi
fi
```

### Step 5.8: Final Validation Report (MANDATORY)

Display comprehensive validation results:

```
╔════════════════════════════════════════════════╗
║        VALIDATION RESULTS                      ║
╚════════════════════════════════════════════════╝

TypeScript Compilation:     ✅ PASS (0 errors)
Dependencies:               ✅ PASS (311 packages)
Unit Tests:                 ✅ PASS (13/13)
Server Startup:             ✅ PASS (port 3000)
Health Endpoint:            ✅ PASS (HTTP 200)
OAuth Endpoint:             ✅ PASS (HTTP 400 expected)
Webhook - Slash Commands:   ✅ PASS (responds)
Webhook - Button Actions:   ✅ PASS (responds)
Webhook - No Crashes:       ✅ PASS (no errors in logs)
Message Format:             ✅ PASS (no duplicate body)
Optional Integrations:      ✅ PASS (GitHub gracefully skipped)
Auto-Fixes Applied:         0
Real API Testing:           ⏭️  SKIPPED (no credentials)

╔════════════════════════════════════════════════╗
║  STATUS: 100% PRODUCTION READY ✅              ║
╚════════════════════════════════════════════════╝

All critical systems validated. Bot is ready for deployment.
```

**ONLY claim "100% working" if ALL checks pass.**

If any check fails and cannot be auto-fixed after 3 attempts:
- Report the issue clearly
- Provide manual fix instructions
- Lower the feature parity percentage accordingly
- Do NOT claim "100% working"

## Testing

After generation, verify:
- [ ] All TypeScript code compiles without errors
- [ ] package.json has all required dependencies
- [ ] .env.example has all necessary variables
- [ ] README.md has complete setup instructions
- [ ] MIGRATION_GUIDE.md documents feature parity accurately
- [ ] Generated code follows Zoom best practices
- [ ] **Tests pass (npm test) - VERIFIED**
- [ ] **Server starts successfully - VERIFIED**
- [ ] **Health endpoint responds - VERIFIED**
- [ ] **Webhooks respond without crashes - VERIFIED**
- [ ] **No duplicate body fields in messages - VERIFIED**
- [ ] **Optional integrations don't crash - VERIFIED**
- [ ] **Server logs show no critical errors - VERIFIED**
