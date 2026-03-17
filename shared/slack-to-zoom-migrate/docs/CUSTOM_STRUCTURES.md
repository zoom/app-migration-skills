# Custom Structures Guide

## 🎯 Key Principle: Structure is Completely Flexible

**You are NOT limited to predefined sections!** Create whatever structure your app needs.

---

## The "Standard Pattern" is Just a Starting Point

The standard pattern (title → separator → creator → status → buttons) is a **common pattern**, not a requirement.

**You can:**
- ✅ Create entirely new section types
- ✅ Use different layouts
- ✅ Add custom headers and emojis
- ✅ Nest information differently
- ✅ Invent new patterns specific to your app

---

## Example 1: Kanban Board App (Custom Layout)

**App needs:** Show columns with tasks

```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*📋 Sprint 23 Board*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

// Custom section: Columns view
body.push({ type: 'message', text: `*🔖 To Do (3)*` });
body.push({ type: 'message', text: `• Task A\n• Task B\n• Task C` });

body.push({ type: 'message', text: `\n*🔄 In Progress (2)*` });
body.push({ type: 'message', text: `• Task D\n• Task E` });

body.push({ type: 'message', text: `\n*✅ Done (5)*` });
body.push({ type: 'message', text: `• Task F\n• Task G\n• Task H\n• Task I\n• Task J` });

body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({
  type: 'actions',
  items: [
    { text: '➕ Add Task', value: 'add', style: 'Primary' },
    { text: '👁 View Board', value: 'view', style: 'Default' }
  ]
});

return { head: { text: 'Kanban' }, body: body };
```

**Output:**
```
*📋 Sprint 23 Board*
━━━━━━━━━━━━━━━━━━━━
*🔖 To Do (3)*
• Task A
• Task B
• Task C

*🔄 In Progress (2)*
• Task D
• Task E

*✅ Done (5)*
• Task F
• Task G
• Task H
• Task I
• Task J
━━━━━━━━━━━━━━━━━━━━
[➕ Add Task] [👁 View Board]
```

**Custom sections:** Kanban columns (not in standard pattern!)

---

## Example 2: Calendar App (Time-Based Layout)

**App needs:** Show events by time

```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*📅 Today's Schedule - March 15*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

// Custom section: Timeline view
events.forEach(event => {
  const icon = event.type === 'meeting' ? '📞' : '📌';
  body.push({
    type: 'message',
    text: `${icon} *${event.time}* - ${event.title}\n    _${event.location}_`
  });
});

body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `_3 events today • 2 hours free_` });

return { head: { text: 'Calendar' }, body: body };
```

**Output:**
```
*📅 Today's Schedule - March 15*
━━━━━━━━━━━━━━━━━━━━
📞 *9:00 AM* - Team Standup
    _Zoom Room A_
📌 *2:00 PM* - Code Review
    _Conference Room B_
📞 *4:00 PM* - Client Call
    _Zoom_
━━━━━━━━━━━━━━━━━━━━
_3 events today • 2 hours free_
```

**Custom sections:** Timeline with time + location (not in standard pattern!)

---

## Example 3: Code Review App (Diff View)

**App needs:** Show code changes

```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🔀 PR #234: Fix Auth Bug*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `👤 _Alice → main_` });

// Custom section: File changes
body.push({ type: 'message', text: `\n*📝 Files Changed (3)*` });
body.push({ type: 'message', text: `• auth.ts ~(+12, -5)~` });
body.push({ type: 'message', text: `• login.tsx ~(+8, -2)~` });
body.push({ type: 'message', text: `• config.ts ~(+1, -0)~` });

// Custom section: Checks status
body.push({ type: 'message', text: `\n*🔍 Checks*` });
body.push({ type: 'message', text: `✅ Tests: Passed (42/42)` });
body.push({ type: 'message', text: `✅ Lint: No errors` });
body.push({ type: 'message', text: `✅ Build: Success` });

// Custom section: Reviewers
body.push({ type: 'message', text: `\n*👥 Reviewers*` });
body.push({ type: 'message', text: `✅ Bob - Approved` });
body.push({ type: 'message', text: `⏳ Carol - Pending` });

body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({
  type: 'actions',
  items: [
    { text: '✅ Approve', value: 'approve', style: 'Primary' },
    { text: '💬 Comment', value: 'comment', style: 'Default' },
    { text: '❌ Request Changes', value: 'changes', style: 'Danger' }
  ]
});

return { head: { text: 'GitHub' }, body: body };
```

**Output:**
```
*🔀 PR #234: Fix Auth Bug*
━━━━━━━━━━━━━━━━━━━━
👤 _Alice → main_

*📝 Files Changed (3)*
• auth.ts (+12, -5)
• login.tsx (+8, -2)
• config.ts (+1, -0)

*🔍 Checks*
✅ Tests: Passed (42/42)
✅ Lint: No errors
✅ Build: Success

*👥 Reviewers*
✅ Bob - Approved
⏳ Carol - Pending
━━━━━━━━━━━━━━━━━━━━
[✅ Approve] [💬 Comment] [❌ Request Changes]
```

**Custom sections:** Files changed, checks, reviewers (completely custom!)

---

## Example 4: Analytics Dashboard (Metrics Layout)

**App needs:** Show stats and metrics

```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*📊 Weekly Analytics*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `_Week of March 10-16_` });

// Custom section: Metrics grid
body.push({ type: 'message', text: `\n*📈 Performance*` });
body.push({ type: 'message', text:
  `*Users:* 1,234 ~(+12%)~\n` +
  `*Revenue:* $45,678 ~(+8%)~\n` +
  `*Conversions:* 89 ~(+15%)~`
});

// Custom section: Trends
body.push({ type: 'message', text: `\n*🔥 Top Trends*` });
body.push({ type: 'message', text:
  `🥇 Mobile traffic ▰▰▰▰▰▰▰▰ 80%\n` +
  `🥈 Desktop traffic ▰▰▰ 30%\n` +
  `🥉 Tablet traffic ▰ 10%`
});

// Custom section: Alerts
body.push({ type: 'message', text: `\n*⚠️ Alerts*` });
body.push({ type: 'message', text: `❌ Server latency above threshold` });
body.push({ type: 'message', text: `⚠️ API errors increased 5%` });

body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({
  type: 'actions',
  items: [
    { text: '📊 Full Report', value: 'report', style: 'Primary' },
    { text: '⚙️ Settings', value: 'settings', style: 'Default' }
  ]
});

return { head: { text: 'Analytics' }, body: body };
```

**Custom sections:** Metrics, trends with bars, alerts (all custom!)

---

## Example 5: Form Builder (Multi-Step)

**App needs:** Show form fields with validation

```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*📝 Customer Feedback Form*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `_Step 2 of 3_` });

// Custom section: Progress bar
body.push({ type: 'message', text: `\n▰▰▰▰▰▰▱▱▱ 67%` });

// Custom section: Current question
body.push({ type: 'message', text: `\n*❓ How would you rate our service?*` });

// Custom section: Scale buttons (1-10)
const scaleButtons = [];
for (let i = 1; i <= 10; i++) {
  scaleButtons.push({
    text: `${i}`,
    value: `rate_${i}`,
    style: 'Default'
  });
}

body.push({ type: 'actions', items: scaleButtons.slice(0, 5) });
body.push({ type: 'actions', items: scaleButtons.slice(5, 10) });

// Custom section: Navigation
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({
  type: 'actions',
  items: [
    { text: '← Back', value: 'back', style: 'Default' },
    { text: 'Skip', value: 'skip', style: 'Default' },
    { text: 'Cancel', value: 'cancel', style: 'Danger' }
  ]
});

return { head: { text: 'Form' }, body: body };
```

**Custom sections:** Progress bar, scale buttons in 2 rows, navigation (all custom!)

---

## How to Create Custom Structures

### Step 1: Analyze Slack App Messages

Look at what the Slack app displays:
- What sections does it have?
- What information is shown?
- How is it organized?
- What interactions are available?

### Step 2: Map to Zoom Message Body Items

For each piece of information, create a body item:

```typescript
// For text content
body.push({
  type: 'message',
  text: 'Your content here'
});

// For buttons
body.push({
  type: 'actions',
  items: [
    { text: 'Button', value: 'value', style: 'Primary' }
  ]
});
```

### Step 3: Add Visual Hierarchy

Use markdown and emojis:
- `*Bold*` for headers
- `_Italic_` for context
- `~Strike~` for changes
- Emojis for visual interest
- `━━━` for separators

### Step 4: Test and Iterate

Send the message to Zoom and see how it looks. Adjust as needed!

---

## Core Building Blocks

You have complete freedom, but these are your building blocks:

### Text Content Block
```typescript
body.push({
  type: 'message',
  text: 'Any markdown text'
});
```

### Action Buttons Block
```typescript
body.push({
  type: 'actions',
  items: [
    { text: 'Label', value: 'data', style: 'Primary|Default|Danger' }
  ]
});
```

**That's it!** Combine these in any way you want.

---

## Decision Framework

**When creating a custom structure, ask:**

1. **What information does the Slack app show?**
   → Create text blocks for each piece

2. **Is there a hierarchy?**
   → Use bold for headers, regular for details

3. **Are items grouped?**
   → Use separators between groups

4. **What actions can users take?**
   → Create button blocks

5. **Does it need visual interest?**
   → Add emojis and formatting

6. **Is it too long?**
   → Split into multiple messages or summarize

---

## Examples of Completely Unique Structures

### E-commerce Order Status
```typescript
body.push({ type: 'message', text: `*🛍️ Order #12345*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `*Items (3)*\n• Widget A x2\n• Widget B x1` });
body.push({ type: 'message', text: `\n*📦 Shipping*\nOut for delivery • Arrives today by 8pm` });
body.push({ type: 'message', text: `\n*💳 Payment*\n$124.99 • Paid with Visa ****1234` });
```

### Recipe App
```typescript
body.push({ type: 'message', text: `*🍝 Spaghetti Carbonara*` });
body.push({ type: 'message', text: `⏱️ 20 min • 👥 4 servings • 🔥 Easy` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `*🛒 Ingredients*\n• 400g spaghetti\n• 200g bacon\n• 4 eggs\n• Parmesan` });
body.push({ type: 'message', text: `\n*👨‍🍳 Steps*\n1. Boil pasta\n2. Fry bacon\n3. Mix eggs\n4. Combine` });
```

### Weather Alert
```typescript
body.push({ type: 'message', text: `*⚠️ Severe Weather Alert*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `🌩️ *Thunderstorm Warning*\nSan Francisco Bay Area` });
body.push({ type: 'message', text: `\n⏰ *Valid until:* 6:00 PM PST` });
body.push({ type: 'message', text: `\n*⚠️ Hazards:*\n• Heavy rain\n• Lightning\n• Winds up to 40mph` });
body.push({ type: 'message', text: `\n*💡 Action:* Stay indoors if possible` });
```

---

## Summary

**Key Points:**

1. ✅ Structure is **100% flexible** - create what you need
2. ✅ Only building blocks are `message` and `actions` types
3. ✅ Analyze the Slack app to understand what sections it needs
4. ✅ Use markdown, emojis, and separators for visual hierarchy
5. ✅ Test in Zoom and iterate
6. ✅ No rigid template - **invent your own structure!**

**The "standard pattern" is just a common starting point. Feel free to create completely custom structures based on your app's unique needs!**
