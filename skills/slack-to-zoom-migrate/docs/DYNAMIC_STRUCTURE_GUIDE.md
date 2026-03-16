# Dynamic Structure Guide

## 🎯 Key Principle: Structure Adapts to Data

**The message structure is NOT rigid** - it adapts based on what data is available in your Slack app.

---

## Structure Variations by Complexity

### Level 1: Minimal Message (No Interactions)

**Use case:** Notifications, announcements, simple alerts

**Structure:**
```typescript
const body: any[] = [];

body.push({
  type: 'message',
  text: `*📢 ${title}*`
});

body.push({
  type: 'message',
  text: `━━━━━━━━━━━━━━━━━━━━`
});

body.push({
  type: 'message',
  text: content
});

return { head: { text: 'App' }, body: body };
```

**Example Output:**
```
*📢 System Maintenance*
━━━━━━━━━━━━━━━━━━━━
The system will be down for maintenance from 2am-4am tonight.
```

**Sections used:** Title, separator, content only

---

### Level 2: Message with Context

**Use case:** Team updates, project notifications with creator info

**Structure:**
```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🎯 ${title}*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

body.push({ type: 'message', text: content });

return { head: { text: 'App' }, body: body };
```

**Example Output:**
```
*🎯 Project Alpha Kickoff*
━━━━━━━━━━━━━━━━━━━━
👤 _Created by Alice_
Meeting scheduled for tomorrow at 10am in Conference Room B.
```

**Sections used:** Title, separator, creator, content

---

### Level 3: Status/Progress Message

**Use case:** Workflows, approvals, multi-step processes

**Structure:**
```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🎯 ${title}*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

if (status) {
  body.push({ type: 'message', text: `\n*📊 Status*\n${status}` });
}

if (items && items.length > 0) {
  let itemsText = '\n*Items:*\n';
  items.forEach(item => itemsText += `• ${item.name}: ${item.status}\n`);
  body.push({ type: 'message', text: itemsText });
}

return { head: { text: 'App' }, body: body };
```

**Example Output:**
```
*🎯 Approval Request #1234*
━━━━━━━━━━━━━━━━━━━━
👤 _Created by Bob_

*📊 Status*
2/3 approvals received

*Approvals:*
• Alice: ✅ Approved
• Bob: ✅ Approved
• Carol: ⏳ Pending
```

**Sections used:** Title, separator, creator, status, items list

---

### Level 4: Interactive Message (with Actions)

**Use case:** Polls, forms, task actions, approvals

**Structure:**
```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🎯 ${title}*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

if (status) {
  body.push({ type: 'message', text: `\n*📊 Status*\n${status}` });
}

if (instructions) {
  body.push({ type: 'message', text: `\n*🎲 ${instructions}*` });
}

if (buttons && buttons.length > 0) {
  // Chunk buttons into rows of 5
  for (let i = 0; i < buttons.length; i += 5) {
    body.push({
      type: 'actions',
      items: buttons.slice(i, i + 5)
    });
  }
}

// Separator before control buttons
if (controlButtons && controlButtons.length > 0) {
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
  body.push({
    type: 'actions',
    items: controlButtons
  });
}

return { head: { text: 'App' }, body: body };
```

**Example Output:**
```
*🎯 Team Lunch Poll*
━━━━━━━━━━━━━━━━━━━━
👤 _Created by Alice_

*📊 Status*
3 votes cast

*🍕 Pick Your Preference:*
[Pizza] [Sushi] [Burgers] [Tacos] [Salad]
━━━━━━━━━━━━━━━━━━━━
[View Results] [Close Poll]
```

**Sections used:** Title, separator, creator, status, instructions, choice buttons, separator, control buttons

---

### Level 5: Results/Summary Message

**Use case:** Poll results, reports, completed workflows

**Structure:**
```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🎯 ${title}*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

// Results header
body.push({ type: 'message', text: `\n*✨ Results ✨*\n` });

// Individual results
if (individualResults) {
  body.push({ type: 'message', text: individualResults });
}

// Summary/aggregated results
if (summary) {
  body.push({ type: 'message', text: `\n${summary}` });
}

// Average/totals
if (totals) {
  body.push({ type: 'message', text: `\n*📊 Summary*\n${totals}` });
}

// Follow-up actions
if (followUpActions && followUpActions.length > 0) {
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
  body.push({
    type: 'actions',
    items: followUpActions
  });
}

return { head: { text: 'App' }, body: body };
```

**Example Output:**
```
*🎯 Team Lunch Poll*
━━━━━━━━━━━━━━━━━━━━
👤 _Created by Alice_

*✨ Results ✨*

*Individual Votes:*
• Alice: Pizza
• Bob: Pizza
• Carol: Sushi

*Vote Distribution:*
Pizza: ▰▰ (2 votes)
Sushi: ▰ (1 vote)

*📊 Summary*
Winner: Pizza 🍕
━━━━━━━━━━━━━━━━━━━━
[New Poll] [Archive]
```

**Sections used:** Title, separator, creator, results header, individual results, summary, totals, separator, follow-up actions

---

## Conditional Logic Patterns

### Pattern 1: Optional Creator
```typescript
if (creator || creatorName) {
  body.push({
    type: 'message',
    text: `👤 _Created by ${creator || creatorName}_`
  });
}
```

### Pattern 2: Optional Status with Emoji
```typescript
if (status) {
  const emoji = getStatusEmoji(status); // ✅, ⏳, ❌, etc.
  body.push({
    type: 'message',
    text: `\n*${emoji} Status*\n${status}`
  });
}
```

### Pattern 3: Conditional Items List
```typescript
if (items && items.length > 0) {
  let itemsText = '\n*Items:*\n';
  items.forEach(item => {
    const icon = item.completed ? '✅' : '⏳';
    itemsText += `${icon} ${item.name}\n`;
  });
  body.push({ type: 'message', text: itemsText });
}
```

### Pattern 4: Optional Buttons with Separator
```typescript
if (buttons && buttons.length > 0) {
  // Add separator before buttons
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

  // Chunk buttons into rows
  for (let i = 0; i < buttons.length; i += 5) {
    body.push({
      type: 'actions',
      items: buttons.slice(i, i + 5)
    });
  }
}
```

### Pattern 5: State-Based Structure
```typescript
if (state === 'active') {
  // Show input UI
  body.push({ type: 'message', text: `*🎲 Take Action:*` });
  body.push({ type: 'actions', items: actionButtons });
} else if (state === 'completed') {
  // Show results
  body.push({ type: 'message', text: `*✨ Results ✨*` });
  body.push({ type: 'message', text: resultsText });
} else if (state === 'cancelled') {
  // Show cancellation message
  body.push({ type: 'message', text: `*❌ Cancelled*` });
}
```

---

## Decision Tree: Which Sections to Include?

```
START
  ↓
[Title + Separator] ← ALWAYS include
  ↓
Has creator?
  Yes → Add creator section
  No → Skip
  ↓
Has status/progress?
  Yes → Add status section
  No → Skip
  ↓
Has list of items?
  Yes → Add items section
  No → Skip
  ↓
Has detailed content?
  Yes → Add content sections
  No → Skip
  ↓
Has action buttons?
  Yes → Add separator + buttons
  No → Skip
  ↓
Has control buttons?
  Yes → Add separator + controls
  No → Skip
  ↓
DONE - return { head, body }
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Include empty sections
```typescript
// ❌ WRONG
body.push({ type: 'message', text: `👤 _Created by undefined_` });
body.push({ type: 'message', text: `\n*Status*\n` }); // No status!
```

### ✅ DO: Check before adding
```typescript
// ✅ CORRECT
if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

if (status && status.length > 0) {
  body.push({ type: 'message', text: `\n*Status*\n${status}` });
}
```

### ❌ DON'T: Add separator without content after
```typescript
// ❌ WRONG - separator with nothing after
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
return { head, body }; // No buttons!
```

### ✅ DO: Add separator only when needed
```typescript
// ✅ CORRECT
if (buttons && buttons.length > 0) {
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
  body.push({ type: 'actions', items: buttons });
}
```

---

## Real-World Examples

### Example 1: GitHub PR Notification (Minimal)
```typescript
body.push({ type: 'message', text: `*🔀 New Pull Request*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `PR #123: Fix login bug` });
body.push({ type: 'message', text: `<https://github.com/...>` });
// No creator, no buttons - just notification
```

### Example 2: Jira Issue (With Status)
```typescript
body.push({ type: 'message', text: `*🐛 PROJ-456*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `👤 _Assigned to Bob_` });
body.push({ type: 'message', text: `\n*📊 Status*\nIn Progress` });
body.push({ type: 'message', text: `\n*Priority:* High\n*Sprint:* 23` });
// Has assignee and status, no buttons
```

### Example 3: Survey (Full Interactive)
```typescript
body.push({ type: 'message', text: `*📋 Q1 Customer Survey*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `👤 _Created by Marketing_` });
body.push({ type: 'message', text: `\n*📊 Responses*\n42 responses` });
body.push({ type: 'message', text: `\n*💬 Rate Our Service:*` });
body.push({ type: 'actions', items: ratingButtons }); // 1-5 stars
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'actions', items: [viewResults, closeSurvey] });
// All sections used
```

---

## Summary

**Key Takeaways:**
1. ✅ Structure is **dynamic and conditional**
2. ✅ Only include sections when **data exists**
3. ✅ Use **if statements** to check before adding
4. ✅ No rigid template - **adapt to your app's needs**
5. ✅ Simple messages = few sections, complex messages = many sections

**The structure pattern is flexible - use what you need!**
