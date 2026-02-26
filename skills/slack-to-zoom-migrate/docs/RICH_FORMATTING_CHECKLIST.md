# Rich Formatting Checklist

## 📚 Official Zoom Documentation

**ALWAYS refer to official docs:** [docs/ZOOM_OFFICIAL_DOCS.md](./ZOOM_OFFICIAL_DOCS.md)

**Primary References:**
- [Markdown Documentation](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/)
- [Customize Chatbot Messages](https://developers.zoom.us/docs/team-chat/customizing-messages/)
- [Buttons](https://developers.zoom.us/docs/team-chat/customizing-messages/buttons/)
- [Chatbot Message Cards](https://developers.zoom.us/docs/team-chat/chatbot/extend/bot-cards/)

## ⚠️ CRITICAL: Every Message MUST Be Rich

When converting Slack apps to Zoom, **never** create plain messages. Always use rich markdown formatting.

## 🚨 Markdown Syntax Warning

**Zoom uses SINGLE asterisk for bold** (`*text*`), **NOT double** (`*text*`)!

| Format | ❌ GitHub/Wrong | ✅ Zoom/Correct |
|--------|-----------------|-----------------|
| Bold | `*text*` | `*text*` |
| Italic | `*text*` | `_text_` |
| Strikethrough | `~~text~~` | `~text~` |

---

## 🚨 Message Structure Rule

**CRITICAL: Use multiple body items, NOT a single concatenated text!**

**❌ WRONG:**
```typescript
body: [
  {
    type: 'message',
    text: `# Title\n\nCreator: Alice\nStatus: Active\n...`  // All concatenated!
  }
]
```

**✅ CORRECT:**
```typescript
const body: any[] = [];

body.push({ type: 'message', text: `*🎯 Title*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
body.push({ type: 'message', text: `👤 _Created by Alice_` });
body.push({ type: 'message', text: `\n*📊 Status*\nActive` });

return { head: { text: 'App' }, body: body };
```

**Why?** Each section renders separately with proper spacing in Zoom, creating a professional appearance.

### Dynamic Structure - Adapt to Available Data

**Not every message has all sections!** Use conditional logic:

```typescript
const body: any[] = [];

// Title & separator (always)
body.push({ type: 'message', text: `*🎯 ${title}*` });
body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });

// Creator (only if exists)
if (creator) {
  body.push({ type: 'message', text: `👤 _Created by ${creator}_` });
}

// Status (only if exists)
if (status) {
  body.push({ type: 'message', text: `\n*📊 Status*\n${status}` });
}

// Buttons (only if exist)
if (actions && actions.length > 0) {
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
  body.push({ type: 'actions', items: actions });
}

return { head: { text: 'App' }, body: body };
```

**Examples:**
- Simple notification → Just title + separator + text
- Task with creator → Title + separator + creator + details
- Interactive poll → Title + separator + status + buttons
- Full form → All sections

**Rule:** Include sections **only when data exists**. Don't add empty sections!

---

## The 7 Core Patterns (Use Conditionally!)

**💡 Note:** Examples below use generic terminology (items, status, actions) that apply to ANY app type - adapt the specific text and emojis to match your app's domain (e.g., tasks, polls, surveys, forms, etc.).

### 1. ✅ Visual Separators

```typescript
body.push({
  type: 'message',
  text: `━━━━━━━━━━━━━━━━━━━━`,
});
```

**Use separators:**
- After title
- Before button sections
- Between major sections

---

### 2. ✅ Bold Titles with Emojis

```typescript
body.push({
  type: 'message',
  text: `*🎯 ${title}*`,
});
```

**Common title emojis:**
- 🎯 Goals/Objectives
- 📊 Data/Stats
- 🗳️ Voting/Polls
- 📝 Forms/Surveys
- ✅ Tasks/Todos

---

### 3. ✅ Creator Context with Italics

```typescript
body.push({
  type: 'message',
  text: `👤 _Created by ${creatorName}_`,
});
```

**Other context patterns:**
- `⏱️ _Created ${timeAgo}_`
- `🏷️ _Category: ${category}_`
- `📍 _Channel: ${channelName}_`

---

### 4. ✅ Emoji-Rich Section Headers

```typescript
// Active state
body.push({
  type: 'message',
  text: `\n*🎲 Take Action:*`,
});

// Success state
body.push({
  type: 'message',
  text: `\n**✨ Results Revealed ✨**\n`,
});

// Error/Cancelled state
body.push({
  type: 'message',
  text: `\n**❌ Session Cancelled**\n_This session has been closed_`,
});
```

**Common section emojis:**
- 📊 Status/Stats
- 📈 Progress/Growth
- 🎲 Actions/Choices
- ✨ Special/Highlight
- 👁 Reveal/Show
- ❌ Cancel/Error
- 🔄 Restart/Refresh

---

### 5. ✅ Button Chunking (5 Per Row)

```typescript
// Create button rows (5 buttons per row)
const buttonRows: string[][] = [];
let currentRow: string[] = [];

options.forEach((option, index) => {
  currentRow.push(option);
  if (currentRow.length === 5 || index === options.length - 1) {
    buttonRows.push([...currentRow]);
    currentRow = [];
  }
});

// Add button rows
buttonRows.forEach((row) => {
  body.push({
    type: 'actions',
    items: row.map((option) => ({
      text: option,
      value: JSON.stringify({ action: 'vote', option }),
      style: 'Default',
    })),
  });
});
```

---

### 6. ✅ Individual Status (Never Just Counts)

**❌ BAD:**
```typescript
text: `Items: 3/5`
```

**✅ GOOD:**
```typescript
text: `\n*📊 Current Status*\n3 item(s) completed ✅`

// Even better - show individual status:
text: `\n**Participants:**\n• Alice: ✅\n• Bob: ✅\n• Charlie: ⏳ awaiting`
```

---

### 7. ✅ Visual Bars for Results

```typescript
function formatResults(votes: { [key: string]: number }): string {
  const results: string[] = [];
  const sortedOptions = Object.entries(votes)
    .sort((a, b) => b[1] - a[1]);

  for (const [option, count] of sortedOptions) {
    const bar = '▰'.repeat(Math.min(count, 10));
    results.push(`*${option}*: ${count} vote(s) ${bar}`);
  }

  return results.join('\n');
}

body.push({
  type: 'message',
  text: formatResults({ 'Option A': 5, 'Option B': 3 }),
});

// Output:
// **Option A**: 5 vote(s) ▰▰▰▰▰
// **Option B**: 3 vote(s) ▰▰▰
```

---

## Complete Message Template

```typescript
function buildRichMessage(data: any): any[] {
  const body: any[] = [];

  // 1. Title with emoji and bold
  body.push({
    type: 'message',
    text: `*🎯 ${data.title}*`,
  });

  // 2. Visual separator
  body.push({
    type: 'message',
    text: `━━━━━━━━━━━━━━━━━━━━`,
  });

  // 3. Creator context
  body.push({
    type: 'message',
    text: `👤 _Created by ${data.creator}_`,
  });

  // 4. Status with emoji header
  if (data.status) {
    body.push({
      type: 'message',
      text: `\n**📊 Status**\n${data.status}`,
    });
  }

  // 5. Individual items (not just counts)
  if (data.items && data.items.length > 0) {
    body.push({
      type: 'message',
      text: `\n*Items:*`,
    });

    const itemsText = data.items
      .map(item => `• *${item.name}*: ${item.value}`)
      .join('\n');

    body.push({
      type: 'message',
      text: itemsText,
    });
  }

  // 6. Visual bars for results
  if (data.results) {
    body.push({
      type: 'message',
      text: formatResults(data.results),
    });
  }

  // 7. Separator before buttons
  if (data.buttons && data.buttons.length > 0) {
    body.push({
      type: 'message',
      text: `━━━━━━━━━━━━━━━━━━━━`,
    });

    // 8. Button header with emoji
    body.push({
      type: 'message',
      text: `\n**🎲 Choose an option:**`,
    });

    // 9. Chunked buttons (5 per row)
    const buttonRows: any[][] = [];
    for (let i = 0; i < data.buttons.length; i += 5) {
      buttonRows.push(data.buttons.slice(i, i + 5));
    }

    buttonRows.forEach(row => {
      body.push({
        type: 'actions',
        items: row,
      });
    });
  }

  return body;
}
```

---

## State-Based Layouts

Different states should have different formatting:

### Active State
- Show current status with 📊
- Display individual participation (✅ completed, ⏳ awaiting)
- Include action buttons (voting, submitting)

### Revealed/Complete State
- Use ✨ for reveals
- Show individual results
- Display aggregated data with bars (▰▰▰)
- Show average/summary stats

### Cancelled/Error State
- Use ❌ for errors/cancellations
- Show what was completed before cancellation
- Brief explanation in italics

---

## Quick Reference: Emoji Usage

| Purpose | Emoji | Example |
|---------|-------|---------|
| Title/Goal | 🎯 | `*🎯 Sprint Planning*` |
| Data/Stats | 📊 | `*📊 Current Status*` |
| Progress | 📈 | `*📈 Growth Report*` |
| User/Creator | 👤 | `👤 _Created by Alice_` |
| Voting | 🗳️ | `3 vote(s) cast 🗳️` |
| Actions | 🎲 | `*🎲 Cast Your Vote:*` |
| Success | ✅ | `• Alice: ✅` |
| Pending | ⏳ | `• Bob: ⏳ awaiting` |
| Reveal | 👁 | `👁 Reveal` button |
| Highlight | ✨ | `*✨ Results Revealed ✨*` |
| Cancel | ❌ | `*❌ Session Cancelled*` |
| Restart | 🔄 | `🔄 Restart` button |
| Time | ⏱️ | `⏱️ _2 hours ago_` |
| Location | 📍 | `📍 _#general channel_` |
| Category | 🏷️ | `🏷️ _Bug Report_` |

---

## References

- Full documentation: `docs/api-mapping/formatting.md`
- Code examples: `docs/code-examples/markdown-conversion.md`
- Working example: `examples/poker-planner-zoom/src/zoom/messaging.ts`
- Template function: `templates/general/src/zoom/messaging.ts` - `sendRichMessage()`

---

## Before You Generate Code

**Checklist:**
- [ ] Read the working example in `examples/poker-planner-zoom/src/zoom/messaging.ts`
- [ ] Review this checklist
- [ ] Have the emoji quick reference handy
- [ ] Remember: **Never generate plain messages!**
