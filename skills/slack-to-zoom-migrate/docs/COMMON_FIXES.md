# Common Fixes for Migrated Apps

This document contains common fixes that should be applied to migrated Zoom apps based on real-world testing.

## 1. Button Actions Must Use Channel ID from Webhook

**Issue:** When handling button clicks (e.g., "Restart", "Retry", "New Item"), new messages are sent to the user's DMs instead of back to the original channel.

**Root Cause:** Button action handlers use `userJid` as the destination instead of the channel where the button was clicked.

**Fix:**

### Step 1: Extract `toJid` from webhook payload

In `webhook.ts`, when handling `interactive_message_actions`:

```typescript
// ❌ WRONG - Missing toJid
if (body.event === 'interactive_message_actions') {
  const { userJid, userName, accountId, actionItem } = body.payload;

  handleButtonAction({
    userJid,
    userName,
    accountId,
    actionValue: actionItem.value,
  });
}

// ✅ CORRECT - Include toJid
if (body.event === 'interactive_message_actions') {
  const { userJid, userName, accountId, actionItem, toJid } = body.payload;

  handleButtonAction({
    userJid,
    userName,
    accountId,
    channelId: toJid,  // ← Add this
    actionValue: actionItem.value,
  });
}
```

### Step 2: Update button handler signature

```typescript
// ❌ WRONG
async function handleButtonAction(params: {
  userJid: string;
  userName: string;
  accountId: string;
  actionValue: string;
}) {
  const { userJid, userName, accountId, actionValue } = params;
  // ...
}

// ✅ CORRECT
async function handleButtonAction(params: {
  userJid: string;
  userName: string;
  accountId: string;
  channelId: string;  // ← Add this
  actionValue: string;
}) {
  const { userJid, userName, accountId, channelId, actionValue } = params;
  // ...
}
```

### Step 3: Use channelId when sending messages

```typescript
// ❌ WRONG - Sends to user's DMs
await sendMessage(userJid, 'New message', accountId);

// ✅ CORRECT - Sends back to channel
await sendMessage(channelId, 'New message', accountId);
```

---

## 2. Disable Auto-Reveal for Voting/Survey Apps

**Issue:** In voting or survey apps, results are automatically revealed when all participants complete their action, preventing manual control.

**Root Cause:** Slack Poker Planner had auto-reveal logic that some users don't want in Zoom.

**Fix:**

In session controller or voting logic:

```typescript
// ❌ AUTO-REVEAL (not always desired)
if (allVoted) {
  session.state = 'revealed';
  await updateSessionMessage(session, userJid);
  await SessionStore.remove(sessionId);
} else {
  await updateSessionMessage(session, userJid);
  SessionStore.upsert(session);
}

// ✅ MANUAL REVEAL ONLY (user clicks button)
// Just update the vote count, keep session active
await updateSessionMessage(session, userJid);
SessionStore.upsert(session);
// User must click "Reveal" button to see results
```

**When to use:**
- ✅ Use manual reveal when: Users want control over when results are shown
- ❌ Keep auto-reveal when: Results should be immediate (e.g., quick polls, straw votes)

---

## 3. Message Updates Require Stored Message ID

**Issue:** Cannot update messages because message ID wasn't stored.

**Fix:**

```typescript
// When creating session, store the message ID
const response = await axios.post(
  `${config.zoom.apiHost}/v2/im/chat/messages`,
  messageBody
);

session.messageId = response.data.message_id;  // ← Store this
SessionStore.upsert(session);
```

---

## 4. Import Config Correctly

**Issue:** `Module has no default export` error.

**Fix:**

```typescript
// ❌ WRONG
import config from '../config';

// ✅ CORRECT
import { config } from '../config';
```

---

## Testing Checklist After Migration

After migrating an app, test these common scenarios:

- [ ] Slash command creates item in the correct channel
- [ ] Voting/button clicks update the message in place
- [ ] "Restart" or "Try Again" buttons post to channel (not DMs)
- [ ] Multi-step flows maintain channel context
- [ ] Error messages appear in the right place
- [ ] Session persistence works across server restarts (if using Redis)

---

## Quick Reference

| Scenario | Use `userJid` | Use `channelId` |
|----------|---------------|-----------------|
| Send initial DM to user | ✅ | ❌ |
| Post to channel | ❌ | ✅ |
| Reply to button click | ❌ | ✅ (from `toJid`) |
| Update existing message | ❌ | ✅ (stored `channelId`) |
| Restart/Retry actions | ❌ | ✅ (from webhook) |
| Private ephemeral messages | ✅ | ❌ |

---

**Last Updated:** 2026-02-19
**Applies to:** All Slack-to-Zoom migrations
