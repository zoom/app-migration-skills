# Message Formatting Deep Dive
## Block Kit to Markdown Conversion

*Status:* Production Ready
*Compatibility:* 70% ⚠️
*Last Updated:* 2026-02-19

## 📚 Official Zoom Documentation

**CRITICAL: Always refer to official Zoom docs as source of truth**

**Primary References:**
- [Zoom Markdown Documentation](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/) ← **USE THIS**
- [Customize Chatbot Messages](https://developers.zoom.us/docs/team-chat/customizing-messages/)
- [Chatbot Message Cards](https://developers.zoom.us/docs/team-chat/chatbot/extend/bot-cards/)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Complete Zoom Docs Reference](../ZOOM_OFFICIAL_DOCS.md)

---

## 🚨 CRITICAL: Zoom Markdown Syntax

**Zoom uses SINGLE asterisk for bold** (`*text*`), **NOT double** (`**text**`)!

| Format | Syntax | Example | Support |
|--------|--------|---------|---------|
| **Bold** | `*text*` | `*Hello*` → *Hello* | ✅ |
| **Italic** | `_text_` | `_Hello_` → _Hello_ | ✅ |
| **Strikethrough** | `~text~` | `~Hello~` → ~Hello~ | ✅ |
| **Code** | `` `text` `` | `` `code` `` → `code` | ✅ |
| **Quote** | `> text` | `> Quote` | ✅ |
| **Link** | `<url>` | `<https://zoom.us>` | ✅ |
| **Mention** | `<!jid\|Name>` | `<!user@zoom\|Alice>` | ✅ |
| **Mention All** | `<!all>` | `<!all>` | ✅ |

**❌ WRONG (GitHub-style):**
```
**bold** ~~strikethrough~~ [link](url)
```

**✅ CORRECT (Zoom-style):**
```
*bold* ~strikethrough~ <url>
```

---

## Overview

Slack uses rich Block Kit. Zoom uses basic markdown.

---

## Unsupported Features

*Cannot migrate to Zoom:*
- ❌ Multi-column layouts
- ❌ Image accessories (next to text)
- ❌ Context blocks
- ❌ Dividers
- ❌ Headers (styled)
- ❌ Rich text elements
- ❌ CSS-style properties
- ❌ Tables
- ❌ Code blocks with syntax highlighting

---

## Block Kit Conversion Examples

### Section Block

*Slack:*
```typescript
{
  type: "section",
  text: {
    type: "mrkdwn",
    text: "*Important*\nThis is a message"
  }
}
```

*Zoom:*
```typescript
{
  type: "message",
  text: "*Important*\nThis is a message"
}
```

### Section with Accessory

*Slack:*
```typescript
{
  type: "section",
  text: { type: "mrkdwn", text: "*Profile*" },
  accessory: {
    type: "image",
    image_url: "https://example.com/avatar.png",
    alt_text: "avatar"
  }
}
```

*Zoom (No Accessory):*
```typescript
{
  type: "message",
  text: "*Profile*"
}
// Image must be separate or linked
```

---

## Rich Formatting Best Practices

*CRITICAL: Maintain Richness During Migration*

While Zoom doesn't support Block Kit, you MUST create *rich, detailed messages* using markdown. The goal is to match or exceed the Slack app's UX.

### Pattern 1: Message Structure with Visual Separators

*✅ ALWAYS use this structure:*

```typescript
const body: any[] = [];

// 1. Title - Bold with emoji
body.push({
  type: 'message',
  text: `*🎯 ${title}*`,
});

// 2. Visual separator
body.push({
  type: 'message',
  text: `━━━━━━━━━━━━━━━━━━━━`,
});

// 3. Context (creator, timestamp, etc.)
body.push({
  type: 'message',
  text: `👤 _Created by ${creator}_`,
});

// 4. Main content...

// 5. Separator before buttons
body.push({
  type: 'message',
  text: `━━━━━━━━━━━━━━━━━━━━`,
});

// 6. Action buttons...
```

### Pattern 2: Show Individual Status, NEVER Just Counts

*❌ BAD (Too Simple):*
```
Votes: 2 / 3
```

*✅ GOOD (Rich):*
```typescript
body.push({
  type: 'message',
  text: `\n*📊 Voting Status*\n3 vote(s) cast 🗳️`,
});
```

### Pattern 3: Use Emoji-Rich Headers

*Always use bold + emoji for section headers:*

```typescript
// State-specific headers with emojis
if (state === 'revealed') {
  body.push({
    type: 'message',
    text: `\n*✨ Results Revealed ✨*\n`,
  });
} else if (state === 'active') {
  body.push({
    type: 'message',
    text: `\n*🎲 Cast Your Vote:*`,
  });
}
```

### Pattern 4: Button Chunking (5 Per Row)

*ALWAYS chunk buttons into rows of 5:*

```typescript
// Create button rows (5 buttons per row)
const buttonRows: string[][] = [];
let currentRow: string[] = [];

items.forEach((item, index) => {
  currentRow.push(item);
  if (currentRow.length === 5 || index === items.length - 1) {
    buttonRows.push([...currentRow]);
    currentRow = [];
  }
});

// Add button rows to body
buttonRows.forEach((row) => {
  body.push({
    type: 'actions',
    items: row.map((item) => ({
      text: item,
      value: JSON.stringify({ action: 'vote', item }),
      style: 'Default',
    })),
  });
});
```

### Pattern 5: Results with Visual Bars

*Use bar characters for visual impact:*

```typescript
function formatResults(votes: { [key: string]: string }): string {
  const voteCounts: { [point: string]: number } = {};

  for (const point of Object.values(votes)) {
    voteCounts[point] = (voteCounts[point] || 0) + 1;
  }

  const results: string[] = [];
  const sortedPoints = Object.keys(voteCounts).sort();

  for (const point of sortedPoints) {
    const count = voteCounts[point];
    const bar = '▰'.repeat(Math.min(count, 10));
    results.push(`*${point}*: ${count} vote(s) ${bar}`);
  }

  return results.join('\n');
}

body.push({
  type: 'message',
  text: formatResults(votes),
});
```

### Pattern 6: Complete Example

*See `templates/general/src/zoom/messaging.ts` for the `sendRichMessage()` function* - a complete working example of all these patterns.

### Key Emojis to Use

- 🎯 Titles/Goals
- 👤 User/Creator
- 📊 Status/Stats
- 🗳️ Voting
- ✅ Success/Complete
- ❌ Error/Cancel
- 🔄 Restart/Refresh
- 👁 Reveal/Show
- 🎲 Actions/Choices
- ✨ Special/Highlight
- ▰ Bar charts

*Key Principle:* Just because Zoom uses markdown doesn't mean messages should be plain. Use markdown's full capabilities to create rich, engaging messages.

---

## Migration Checklist

- [ ] Convert `*bold*` to `*bold*`
- [ ] Convert `_italic_` to `*italic*`
- [ ] Convert `~strike~` to `~~strike~~`
- [ ] Convert `<url\|text>` to `[text](url)`
- [ ] Remove accessory elements
- [ ] Flatten multi-column layouts
- [ ] Remove dividers
- [ ] Simplify rich text to plain markdown
- [ ] Test markdown rendering
- [ ] *Add individual participant/item status where applicable*
- [ ] *Use emojis and visual hierarchy*
- [ ] *Chunk buttons into rows (5 per row recommended)*
- [ ] *Show detailed results, not just counts*

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md#4-message-formatting)
- [Code Example: Markdown Conversion](../code-examples/markdown-conversion.md)
