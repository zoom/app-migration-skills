# Button Patterns & Best Practices

## Critical: Maintaining Context in Button Values

### ⚠️ The Channel vs Bot Space Problem

**CRITICAL BUG TO AVOID:** When creating buttons that trigger new actions (restart, retry, new session, etc.), you MUST include `channelId` and `accountId` in the button value, or messages will go to the bot's private space instead of the channel.

### ❌ WRONG - Missing Context

```typescript
// BAD: Restart button without channelId
{
  text: '🔄 Restart',
  value: JSON.stringify({
    action: 'restart',
    title: session.title,
    // Missing channelId! Will send to bot's space
  }),
  style: 'Default',
}
```

**Result:** New session goes to bot's private space, not the channel ❌

### ✅ CORRECT - With Context

```typescript
// GOOD: Include all context needed to recreate the session
{
  text: '🔄 Restart',
  value: JSON.stringify({
    action: 'restart',
    title: session.title,
    channelId: session.channelId,  // ✅ Required!
    accountId: session.accountId,   // ✅ Required!
    // ... other session data
  }),
  style: 'Default',
}
```

**Result:** New session goes to the correct channel ✅

---

## Button Patterns Reference

### 1. Simple Action Button (No Context Needed)

**Use Case:** Action on the current message only (delete, acknowledge, dismiss)

```typescript
{
  text: '✅ Mark Done',
  value: JSON.stringify({
    action: 'mark_done',
    itemId: item.id,
  }),
  style: 'Primary',
}
```

**Handler:**
```typescript
if (action.action === 'mark_done') {
  // Update current message only
  await updateMessage(messageId, newContent, accountId, toJid, userJid);
}
```

---

### 2. Restart/Retry Button (Context Required)

**Use Case:** Create a new message/session with same settings

**⚠️ MUST INCLUDE:** `channelId`, `accountId`, and all data needed to recreate

```typescript
{
  text: '🔄 Restart Session',
  value: JSON.stringify({
    action: 'restart',
    sessionId: session.id,
    channelId: session.channelId,    // ✅ Critical!
    accountId: session.accountId,     // ✅ Critical!
    // All other session data
    title: session.title,
    participants: session.participants,
    settings: session.settings,
  }),
  style: 'Default',
}
```

**Handler:**
```typescript
if (action.action === 'restart') {
  const newSession = await createSession({
    title: action.title,
    channelId: action.channelId,        // Use stored value
    accountId: action.accountId,         // Use stored value
    creatorJid: userJid,                 // Current user
    creatorName: userName,               // Current user
    // ... other fields
  });
}
```

---

### 3. Multi-Step Flow Button (Context Required)

**Use Case:** Button advances to next step in a flow

```typescript
// Step 1 button
{
  text: 'Next: Choose Participants',
  value: JSON.stringify({
    action: 'flow_step',
    flowId: generateId(),
    step: 2,
    channelId: channelId,               // ✅ Pass forward
    accountId: accountId,                // ✅ Pass forward
    data: { title: 'My Session' },      // Accumulated data
  }),
  style: 'Primary',
}
```

**Handler:**
```typescript
if (action.action === 'flow_step') {
  if (action.step === 2) {
    // Send next step message to CHANNEL, not bot
    await sendMessage(
      action.channelId,                  // Use stored channel
      buildStep2Message(action.data),
      action.accountId,                  // Use stored accountId
      userJid                             // User who clicked
    );
  }
}
```

---

### 4. Navigation Button (Same Message)

**Use Case:** Change view/page within the same message

```typescript
{
  text: '📊 View Results',
  value: JSON.stringify({
    action: 'change_view',
    view: 'results',
    sessionId: session.id,
  }),
  style: 'Default',
}
```

**Handler:**
```typescript
if (action.action === 'change_view') {
  // Update the existing message (no new message needed)
  const content = buildView(action.view, session);
  await updateMessage(messageId, content, accountId, toJid, userJid);
}
```

---

## Where Messages Go

### Bot's Private Space (DM with bot)
```typescript
await sendMessage(
  userJid,        // to_jid = user
  message,
  accountId,
  userJid         // user_jid = same user (or omit)
);
```

**When to use:**
- Ephemeral responses to user
- Error messages
- Help text
- Configuration wizards

### Channel (Visible to Everyone)
```typescript
await sendMessage(
  channelId,      // to_jid = channel
  message,
  accountId,
  userJid         // user_jid = user who triggered
);
```

**When to use:**
- Shared content (polls, sessions, announcements)
- Restart/retry actions
- Team collaboration features

---

## Common Mistakes

### ❌ Mistake 1: Forgetting channelId in restart buttons
```typescript
// BUG: Will send to bot's space
channelId: userJid,  // WRONG! This is a user, not a channel
```

**Fix:** Store original `channelId` in button value

### ❌ Mistake 2: Using webhook accountId instead of stored one
```typescript
// BUG: Webhook accountId might differ from original
accountId: accountId,  // This is from webhook payload
```

**Fix:** Use `action.accountId || accountId` (prefer stored)

### ❌ Mistake 3: Not passing context forward in multi-step flows
```typescript
// BUG: Step 2 doesn't know which channel to use
if (step === 2) {
  await sendMessage(userJid, ...);  // Goes to bot!
}
```

**Fix:** Include `channelId` in every step's button value

---

## Testing Checklist

When implementing restart/retry/multi-step buttons:

- [ ] Does button value include `channelId`?
- [ ] Does button value include `accountId`?
- [ ] Does handler use `action.channelId` not `userJid`?
- [ ] Does handler use `action.accountId || accountId`?
- [ ] Test: Click button - new message goes to CHANNEL not bot? ✅
- [ ] Test: Multiple users can click? ✅
- [ ] Test: Context preserved across restarts? ✅

---

## Quick Reference

| Button Type | Needs channelId? | Needs accountId? | Creates New Message? |
|-------------|------------------|------------------|----------------------|
| Simple action | ❌ No | ❌ No | ❌ Updates existing |
| Restart/Retry | ✅ YES | ✅ YES | ✅ Creates new |
| Multi-step flow | ✅ YES | ✅ YES | ✅ Creates new |
| Navigation/View | ❌ No | ❌ No | ❌ Updates existing |
| Delete/Dismiss | ❌ No | ❌ No | ❌ Deletes existing |

---

## See Also

- `ASYNC_OPERATIONS.md` - Message ID tracking and state management
- `RICH_FORMATTING_CHECKLIST.md` - Message formatting patterns
- `API_MAPPING_REFERENCE.md` - Zoom API details
