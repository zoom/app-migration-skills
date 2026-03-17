# Code Example: Rich Markdown Conversion

## 📚 Official Zoom Documentation

**CRITICAL References:**
- [Zoom Markdown Documentation](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/)
- [Complete Zoom Docs](../ZOOM_OFFICIAL_DOCS.md)

## 🚨 Zoom Markdown Syntax

**Zoom uses SINGLE asterisk for bold** (`*text*`), **NOT double** (`**text**`)!

| Format | ❌ Wrong (GitHub) | ✅ Correct (Zoom) |
|--------|-------------------|-------------------|
| Bold | `**text**` | `*text*` |
| Italic | `*text*` | `_text_` |
| Strikethrough | `~~text~~` | `~text~` |

---

## Basic Syntax Conversion

### Slack Block Kit
```typescript
blocks: [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Bold* _italic_ ~strike~\n<https://example.com|Link>'
    }
  }
]
```

### Zoom Markdown
```typescript
content: {
  body: [
    {
      type: 'message',
      text: '*Bold* *italic* ~~strike~~\n[Link](https://example.com)'
    }
  ]
}
```

## Conversion Function

```typescript
function convertMarkdown(slackText: string): string {
  return slackText
    .replace(/\*([^\*]+)\*/g, '*$1*')           // *bold* → *bold*
    .replace(/_([^_]+)_/g, '*$1*')                // _italic_ → *italic*
    .replace(/~([^~]+)~/g, '~~$1~~')              // ~strike~ → ~~strike~~
    .replace(/<([^|>]+)\|([^>]+)>/g, '[$2]($1)'); // <url|text> → [text](url)
}
```

---

## Rich Message Conversion (RECOMMENDED)

*Don't just convert syntax - enhance the structure!*

### Slack Block Kit (Simple)

```typescript
{
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Survey Results*\n3 responses'
      }
    },
    {
      type: 'actions',
      elements: [
        { type: 'button', text: { text: 'Option A' }, value: 'a' },
        { type: 'button', text: { text: 'Option B' }, value: 'b' },
        { type: 'button', text: { text: 'Option C' }, value: 'c' }
      ]
    }
  ]
}
```

### Zoom (Rich Conversion) ✅

```typescript
function buildRichSurveyMessage(title: string, responses: { [key: string]: string }[], creator: string): any[] {
  const body: any[] = [];

  // 1. Title with emoji and bold
  body.push({
    type: 'message',
    text: `*📊 ${title}*`,
  });

  // 2. Visual separator
  body.push({
    type: 'message',
    text: `━━━━━━━━━━━━━━━━━━━━`,
  });

  // 3. Creator context
  body.push({
    type: 'message',
    text: `👤 _Created by ${creator}_`,
  });

  // 4. Status with emoji
  const responseCount = responses.length;
  body.push({
    type: 'message',
    text: `\n*📈 Status*\n${responseCount} response(s) received ✅`,
  });

  // 5. Individual responses (not just count!)
  if (responses.length > 0) {
    body.push({
      type: 'message',
      text: `\n*Responses:*`,
    });

    const responsesText = responses
      .map((r, i) => `• *User ${i + 1}*: ${r.answer}`)
      .join('\n');

    body.push({
      type: 'message',
      text: responsesText,
    });
  }

  // 6. Separator before buttons
  body.push({
    type: 'message',
    text: `━━━━━━━━━━━━━━━━━━━━`,
  });

  // 7. Action buttons in one row (less than 5 buttons)
  body.push({
    type: 'actions',
    items: [
      { text: 'Option A', value: 'a', style: 'Default' },
      { text: 'Option B', value: 'b', style: 'Default' },
      { text: 'Option C', value: 'c', style: 'Default' },
    ],
  });

  return body;
}

// Usage
const messageBody = {
  robot_jid: config.zoom.botJid,
  to_jid: channelId,
  account_id: accountId,
  user_jid: userId,
  is_markdown_support: true,
  content: {
    head: { text: 'Survey Bot' },
    body: buildRichSurveyMessage('Customer Feedback', responses, 'Alice'),
  },
};
```

---

## Button Chunking Example

*For many options, chunk into rows of 5:*

```typescript
function buildVotingButtons(options: string[], sessionId: string): any[] {
  const body: any[] = [];

  // Header
  body.push({
    type: 'message',
    text: `\n*🎲 Cast Your Vote:*`,
  });

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
        value: JSON.stringify({ action: 'vote', sessionId, option }),
        style: 'Default',
      })),
    });
  });

  return body;
}
```

---

## Results Visualization

*Show results with visual bars:*

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

// Usage
body.push({
  type: 'message',
  text: formatResults({ 'Option A': 5, 'Option B': 3, 'Option C': 2 }),
});

// Output:
// *Option A*: 5 vote(s) ▰▰▰▰▰
// *Option B*: 3 vote(s) ▰▰▰
// *Option C*: 2 vote(s) ▰▰
```

---

## State-Based Formatting

*Different layouts for different states:*

```typescript
function buildMessageForState(session: any): any[] {
  const body: any[] = [];

  // Common header
  body.push({ type: 'message', text: `*🎯 ${session.title}*` });
  body.push({ type: 'message', text: `━━━━━━━━━━━━━━━━━━━━` });
  body.push({ type: 'message', text: `👤 _Created by ${session.creator}_` });

  if (session.state === 'active') {
    // Active: Show voting UI
    body.push({
      type: 'message',
      text: `\n*📊 Voting Status*\n${session.voteCount} vote(s) cast 🗳️`,
    });
    // ... add voting buttons
  } else if (session.state === 'revealed') {
    // Revealed: Show results
    body.push({
      type: 'message',
      text: `\n*✨ Results Revealed ✨*\n`,
    });
    body.push({
      type: 'message',
      text: formatResults(session.votes),
    });
  } else if (session.state === 'cancelled') {
    // Cancelled: Show final state
    body.push({
      type: 'message',
      text: `\n*❌ Session Cancelled*\n_This session has been closed_`,
    });
  }

  return body;
}
```

---

## Key Takeaways

1. *Don't just convert syntax* - enhance structure with separators, emojis, and hierarchy
2. *Show individual items* - not just counts
3. *Use visual elements* - separators (━━━), bars (▰▰▰), emojis (🎯📊✅)
4. *Chunk buttons* - 5 per row for readability
5. *State-specific layouts* - different formatting for different states

*See also:*
- [Formatting Deep Dive](../api-mapping/formatting.md)
- [Template Example](../../templates/general/src/zoom/messaging.ts) - `sendRichMessage()` function

[Slack Formatting](https://api.slack.com/reference/surfaces/formatting) | [Zoom Markdown](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/)
