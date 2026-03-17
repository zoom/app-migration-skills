# Common Bugs in Generated Zoom Code

This document lists bugs that the skill should automatically detect and fix during Phase 5 validation.

## 1. Duplicate `body` Field (CRITICAL)

**Symptom:**
- Zoom API returns 400 with code 7001: "Invalid request body format"
- Request has both top-level `body` AND `content.body`

**Root Cause:**
```typescript
// WRONG: Spreading messagePayload copies the 'body' field
const messageBody = {
  robot_jid: config.zoom.botJid,
  account_id: accountId || '',
  ...messagePayload,  // ❌ This includes 'body'
  content: {
    head: messagePayload.head || { text: config.appName },
    body: messagePayload.body,  // ❌ Duplicate!
  },
};
```

**Detection:**
```bash
# Check logs for API error 7001
grep -q "Invalid request body format" /tmp/server-validation.log

# Or check code for spread + content pattern
grep -A 5 '...messagePayload' src/zoom/messaging.ts | grep -q 'content: {'
```

**Auto-Fix:**
```typescript
// CORRECT: Explicitly map only needed fields
const messageBody = {
  robot_jid: config.zoom.botJid,
  account_id: accountId || '',
  to_jid: messagePayload.to_jid,
  user_jid: messagePayload.user_jid,
  is_markdown_support: messagePayload.is_markdown_support !== false,
  content: {
    head: messagePayload.head || { text: config.appName },
    body: messagePayload.body,
  },
};
```

**File:** `src/zoom/messaging.ts` lines ~28-36

---

## 2. Uninitialized Optional Services (CRITICAL)

**Symptom:**
- Server crashes with: "Error: ServiceName not initialized. Call initializeService first."
- Happens when optional integration (GitHub, etc.) is not configured

**Root Cause:**
```typescript
// WRONG: getService() throws if not initialized
const github = getGitHubService();  // ❌ Throws error
try {
  await github.createIssue();
} catch (error) {
  console.error('GitHub error:', error);
  // Never reached because getService() already threw!
}
```

**Detection:**
```bash
# Check logs for initialization errors
grep -q "not initialized. Call initialize" /tmp/server-validation.log

# Or check code for getService() outside try block
grep -B 2 'getGitHubService()' src/app/*.ts | grep -q 'const'
```

**Auto-Fix:**
```typescript
// CORRECT: Move getService() inside try-catch
try {
  const github = getGitHubService();  // ✅ Caught if throws
  await github.createIssue();
} catch (error) {
  console.log('GitHub integration not available, continuing without it');
  // Gracefully continues
}
```

**Files:** `src/app/*Controller.ts` (all controllers using optional services)

---

## 3. Missing `is_markdown_support` Flag

**Symptom:**
- Markdown formatting doesn't render in Zoom
- Zoom API may return error 7002

**Root Cause:**
```typescript
// WRONG: Missing markdown flag
const messageBody = {
  robot_jid: config.zoom.botJid,
  to_jid: toJid,
  // is_markdown_support: true,  // ❌ Missing!
  content: {
    head: { text: 'Title' },
    body: [{ type: 'message', text: '**bold**' }]
  }
};
```

**Detection:**
```bash
# Check for content without markdown support
find src -name "*.ts" -exec grep -l "content: {" {} \; | while read file; do
  if ! grep -B 3 "content: {" "$file" | grep -q "is_markdown_support"; then
    echo "Missing markdown support: $file"
  fi
done
```

**Auto-Fix:**
```typescript
// CORRECT: Always include markdown support
const messageBody = {
  robot_jid: config.zoom.botJid,
  to_jid: toJid,
  is_markdown_support: true,  // ✅ Always true
  content: {
    head: { text: 'Title' },
    body: [{ type: 'message', text: '**bold**' }]
  }
};
```

**Files:** All files creating message payloads

---

## 4. Fire-and-Forget Webhook Pattern Missing

**Symptom:**
- Zoom shows "Command failed" or retries webhook
- Error: "Cannot set headers after they are sent"

**Root Cause:**
```typescript
// WRONG: Async processing blocks response
if (body.event === 'bot_notification') {
  await handleCommand(payload);  // ❌ Zoom waits too long
  res.json({ success: true });   // Sent after timeout
}
```

**Detection:**
```bash
# Check for await before res.json
grep -A 5 "bot_notification" src/zoom/webhook.ts | grep -q "await.*handleCommand"
```

**Auto-Fix:**
```typescript
// CORRECT: Respond immediately, process async
if (body.event === 'bot_notification') {
  res.json({ success: true });  // ✅ Immediate response

  handleCommand(payload).catch(error => {
    console.error('Failed to handle command:', error);
  });
}
```

**File:** `src/zoom/webhook.ts` webhook handler

---

## 5. Incorrect OAuth Grant Type

**Symptom:**
- OAuth token generation fails
- Error 401 or "Invalid grant type"

**Root Cause:**
```typescript
// WRONG: Using account_credentials (Slack pattern)
const response = await axios.post(
  `${config.zoom.oauthHost}/oauth/token?grant_type=account_credentials`,
  // ❌ Wrong grant type
);
```

**Detection:**
```bash
grep -q "grant_type=account_credentials" src/zoom/tokens.ts
```

**Auto-Fix:**
```typescript
// CORRECT: Use client_credentials
const response = await axios.post(
  `${config.zoom.oauthHost}/oauth/token?grant_type=client_credentials`,
  // ✅ Correct for Zoom
);
```

**File:** `src/zoom/tokens.ts` getBotToken function

---

## 6. Style Properties Instead of Markdown

**Symptom:**
- Bold/italic formatting doesn't work
- Zoom API may reject message

**Root Cause:**
```typescript
// WRONG: Using Block Kit style properties
{
  type: 'message',
  text: 'Hello',
  style: 'bold'  // ❌ Not supported in Zoom
}
```

**Detection:**
```bash
grep -r "style: 'bold'" src/ || grep -r "style: 'italic'" src/
```

**Auto-Fix:**
```typescript
// CORRECT: Use markdown syntax
{
  type: 'message',
  text: '**Hello**'  // ✅ Markdown bold
}
```

**Files:** `src/app/MessageBuilder.ts` and any message formatting code

---

---

## 7. Missing `user_jid` in Messages (CRITICAL)

**Symptom:**
- Zoom API returns 400 with code 7001: "Invalid request body format"
- Error messages work but complex messages fail
- Simple text messages succeed but MessageBuilder messages fail

**Root Cause:**
```typescript
// WRONG: MessageBuilder doesn't include user_jid
static buildNominationMessage(
  toJid: string,
  nominator: string,
  location: string
): ZoomMessage {
  return {
    to_jid: toJid,
    // user_jid: ???,  // ❌ Missing!
    is_markdown_support: true,
    body: [...]
  };
}
```

**Detection:**
```bash
# Check MessageBuilder functions for missing user_jid
grep -A 10 "static build" src/app/MessageBuilder.ts | grep -B 10 "return {" | grep -v "user_jid"

# Or check interface definition
grep "export interface ZoomMessage" -A 10 src/app/MessageBuilder.ts
```

**Auto-Fix:**
```typescript
// CORRECT: All MessageBuilder functions need user_jid parameter
static buildNominationMessage(
  toJid: string,
  userJid: string,  // ✅ Add parameter
  nominator: string,
  location: string
): ZoomMessage {
  return {
    to_jid: toJid,
    user_jid: userJid,  // ✅ Include in message
    is_markdown_support: true,
    body: [...]
  };
}

// Update all callers to pass userJid:
const message = MessageBuilder.buildNominationMessage(
  ctx.channelId,
  ctx.userJid,  // ✅ Pass from context
  ctx.userName,
  location
);
```

**Files Affected:**
- `src/app/MessageBuilder.ts` - All `build*Message` functions
- `src/app/*Controller.ts` - All callers of MessageBuilder functions

---

## 8. Lowercase Button Styles (CRITICAL)

**Symptom:**
- Zoom API returns 400 with code 7001: "Invalid request body format"
- Buttons don't render even though payload looks correct
- Slack uses lowercase, Zoom requires capitalized

**Root Cause:**
```typescript
// WRONG: Slack uses lowercase styles
{
  action_id: 'vote_1',
  value: '{"action":"vote"}',
  text: 'Vote',
  style: 'primary'  // ❌ Lowercase (Slack format)
}

// Interface also wrong
export interface InteractiveButton {
  style?: 'primary' | 'danger' | 'default';  // ❌ Lowercase
}
```

**Detection:**
```bash
# Check for lowercase button styles
grep -r "style: '[a-z]" src/app/
grep -r "'primary'\|'danger'\|'default'" src/app/

# Check TypeScript interface
grep "style?:" src/app/MessageBuilder.ts
```

**Auto-Fix:**
```bash
# Fix button styles in code
find src -name "*.ts" -type f -exec sed -i.bak \
  -e "s/style: 'primary'/style: 'Primary'/g" \
  -e "s/style: 'danger'/style: 'Danger'/g" \
  -e "s/style: 'default'/style: 'Default'/g" {} \;

# Fix TypeScript interface
sed -i.bak "s/'primary' | 'danger' | 'default'/'Primary' | 'Danger' | 'Default'/g" \
  src/app/MessageBuilder.ts
```

**Correct Format:**
```typescript
// CORRECT: Zoom requires capitalized styles
{
  action_id: 'vote_1',
  value: '{"action":"vote"}',
  text: 'Vote',
  style: 'Primary'  // ✅ Capitalized (Zoom format)
}

// Interface also correct
export interface InteractiveButton {
  style?: 'Primary' | 'Danger' | 'Default';  // ✅ Capitalized
}
```

**Reference:**
- Slack API: `primary`, `danger` (lowercase)
- Zoom API: `Primary`, `Danger`, `Default` (capitalized)

**Files:** `src/app/MessageBuilder.ts` and any files creating buttons

---

## Auto-Fix Priority

When multiple bugs are detected, fix in this order:

1. **Duplicate body field** (CRITICAL - breaks all messages)
2. **Missing user_jid** (CRITICAL - breaks all complex messages)
3. **Uninitialized services** (CRITICAL - crashes server)
4. **Lowercase button styles** (CRITICAL - breaks interactive messages)
5. **Fire-and-forget pattern** (HIGH - causes webhook failures)
6. **Missing markdown support** (MEDIUM - formatting issues)
7. **OAuth grant type** (MEDIUM - prevents authentication)
8. **Style properties** (LOW - minor formatting issues)

---

## Testing Strategy

After each auto-fix:

1. **Restart server** to load fixed code
2. **Re-test webhooks** to verify fix worked
3. **Check logs** for new errors
4. **Track fix count** for validation report

Maximum 3 auto-fix iterations before reporting failure.

---

## When to Report Failure

Do NOT claim "100% working" if:

- ❌ Auto-fixes don't resolve errors after 3 attempts
- ❌ TypeScript compilation fails
- ❌ Server won't start
- ❌ Webhooks return non-success responses
- ❌ Critical errors still appear in logs

Instead:
- Report specific failures clearly
- Provide manual fix instructions
- Lower feature parity percentage
- Mark as "Partially working - requires fixes"
