# Emoji Mapping Reference

Slack uses emoji **names** (`:smile:`) while some messaging operations may require Unicode emoji. This reference explains emoji handling in Slack → Zoom migrations.

---

## Do You Need Emoji Mapping?

**Short answer:** Probably not for basic migrations.

**Long answer:**
- ✅ **Zoom supports `:smile:` syntax natively** in markdown messages
- ✅ **Most emoji work without conversion** when using `is_markdown_support: true`
- ❌ **Reactions API not supported** in Zoom (emoji conversion not needed)

---

## When Emoji Mapping IS Needed

### 1. Converting Slack Emoji Names to Unicode

If you need to convert Slack's `:emoji_name:` format to actual Unicode characters (e.g., for display in non-markdown contexts):

**Note:** An emoji map is NOT included in this skill because:
- Zoom's markdown handles `:emoji:` syntax natively
- Most migrations don't need emoji conversion
- Better alternatives exist (see npm packages below)

**If you need emoji conversion, use an npm package:**

```bash
npm install node-emoji
```

```typescript
import emoji from 'node-emoji';

function convertEmojiNames(text: string): string {
  return emoji.emojify(text);
}

// Example
const slack = "Great work :thumbsup: :100:";
const unicode = convertEmojiNames(slack);
// Result: "Great work 👍 💯"
```

### 2. Building Emoji Pickers

If your UI needs an emoji picker, use a dedicated npm package:

**Recommended: emoji-mart**

```bash
npm install emoji-mart
```

```typescript
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

function EmojiPicker({ onEmojiSelect }) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji) => {
        onEmojiSelect(emoji.native); // Unicode emoji
      }}
      theme="light"
      set="native"
    />
  );
}
```

**Alternative: Simple custom picker with node-emoji**

```typescript
import emoji from 'node-emoji';

interface EmojiOption {
  name: string;
  emoji: string;
}

function getCommonEmojis(): EmojiOption[] {
  const common = ['smile', 'heart', 'thumbsup', 'tada', '100', 'fire', 'rocket'];
  return common.map(name => ({
    name,
    emoji: emoji.get(name)
  }));
}

function SimpleEmojiPicker() {
  const emojis = getCommonEmojis();

  return (
    <div className="emoji-grid">
      {emojis.map(({ name, emoji: emojiChar }) => (
        <button
          key={name}
          title={`:${name}:`}
          onClick={() => insertEmoji(emojiChar)}
        >
          {emojiChar}
        </button>
      ))}
    </div>
  );
}
```

### 3. Displaying Custom Slack Emoji

**Problem:** Slack allows custom emoji (`:company_logo:`) that won't be in the standard emoji map.

**Solution:**

```typescript
interface CustomEmoji {
  name: string;
  url: string;
}

async function getSlackCustomEmoji(): Promise<CustomEmoji[]> {
  const response = await slack.emoji.list();
  return Object.entries(response.emoji).map(([name, url]) => ({
    name,
    url: url as string
  }));
}

function convertEmojiWithCustom(
  text: string,
  customEmoji: CustomEmoji[]
): string {
  // First, try custom emoji
  customEmoji.forEach(emoji => {
    const pattern = new RegExp(`:${emoji.name}:`, 'g');
    text = text.replace(pattern, `![${emoji.name}](${emoji.url})`);
  });

  // Then, standard emoji
  text = text.replace(/:([a-z0-9_+-]+):/g, (match, emojiName) => {
    return emojiMap[emojiName] || match;
  });

  return text;
}
```

---

## When Emoji Mapping Is NOT Needed

### ✅ Sending Messages with Emoji

Zoom's markdown processor handles `:emoji_name:` automatically:

```typescript
// This works without conversion
await zoom.chat.send({
  to_jid: channelJid,
  robot_jid: botJid,
  account_id: accountId,
  user_jid: userJid,
  is_markdown_support: true,
  content: {
    head: { text: "Message" },
    body: [{
      type: "message",
      text: "Great job :thumbsup: :tada:"
      // Zoom will render: "Great job 👍 🎉"
    }]
  }
});
```

### ✅ Receiving Messages from Zoom

Webhook events already include rendered emoji:

```typescript
function handleWebhook(event: ZoomWebhookEvent) {
  const message = event.payload.message;
  console.log(message); // Already contains Unicode emoji

  // You can display directly, no conversion needed
  displayMessage(message);
}
```

### ❌ Reactions (Not Supported)

Slack's `reactions.add` API doesn't have a Zoom equivalent:

```typescript
// SLACK (works)
await slack.reactions.add({
  channel: "C123",
  timestamp: "1234567890.123456",
  name: "thumbsup" // Emoji name
});

// ZOOM (no equivalent API)
// ❌ There is no reactions.add endpoint
// Solution: Don't migrate reaction features
```

---

## Performance Considerations

### Using node-emoji

**node-emoji** is lightweight (~50KB) and fast:

```typescript
import emoji from 'node-emoji';

// Conversion is fast (no network calls)
const converted = emoji.emojify(text);
```

**Caching converted text (optional):**

```typescript
const conversionCache = new Map<string, string>();

function convertEmojiCached(text: string): string {
  if (conversionCache.has(text)) {
    return conversionCache.get(text)!;
  }

  const converted = emoji.emojify(text);
  conversionCache.set(text, converted);

  // Limit cache size
  if (conversionCache.size > 1000) {
    const firstKey = conversionCache.keys().next().value;
    conversionCache.delete(firstKey);
  }

  return converted;
}
```

### Using emoji-mart

**emoji-mart** is larger (~500KB) but feature-rich:

- Load picker component only when needed (lazy loading)
- Data is bundled with package (no external files)
- Optimized for React rendering

```typescript
// Lazy load emoji picker
import { lazy, Suspense } from 'react';

const EmojiPicker = lazy(() => import('./EmojiPicker'));

function ChatInput() {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>
      {showPicker && (
        <Suspense fallback={<div>Loading...</div>}>
          <EmojiPicker onSelect={insertEmoji} />
        </Suspense>
      )}
    </div>
  );
}
```

---

## Testing Emoji Handling

```typescript
describe('Emoji Handling', () => {
  it('should convert emoji names to Unicode', () => {
    const input = "Hello :smile: world :heart:";
    const output = convertEmojiNames(input);
    expect(output).toBe("Hello 😊 world ❤️");
  });

  it('should preserve unknown emoji names', () => {
    const input = "Custom :company_logo: emoji";
    const output = convertEmojiNames(input);
    expect(output).toBe("Custom :company_logo: emoji");
  });

  it('should handle multiple emoji in sequence', () => {
    const input = ":thumbsup::tada::100:";
    const output = convertEmojiNames(input);
    expect(output).toBe("👍🎉💯");
  });

  it('should not convert emoji with extra colons', () => {
    const input = "File path: /usr/:bin:/local";
    const output = convertEmojiNames(input);
    expect(output).toBe("File path: /usr/:bin:/local");
  });
});
```

---

## Migration Checklist

When migrating Slack apps, consider emoji handling:

- [ ] **Determine if you need emoji conversion**
  - Are you displaying emoji in non-markdown contexts?
  - Do you have an emoji picker UI?
  - Are you processing Slack export data?

- [ ] **If NO conversion needed (90% of cases):**
  - ✅ Use Zoom's markdown (`:emoji_name:` works automatically)
  - ✅ No additional dependencies needed
  - ✅ Simpler implementation

- [ ] **If YES conversion needed:**
  - [ ] Install emoji library: `npm install node-emoji` (simple) or `emoji-mart` (picker)
  - [ ] Implement conversion using library methods
  - [ ] Handle custom Slack emoji separately (fetch from Slack API)
  - [ ] Add tests for edge cases
  - [ ] Consider performance (lazy loading for emoji-mart)

- [ ] **Document emoji limitations:**
  - [ ] Reactions API not available (remove from UI)
  - [ ] Custom emoji need image hosting
  - [ ] Some obscure emoji may not render on all devices

---

## Recommended Emoji Libraries

Use these actively-maintained npm packages instead of custom emoji maps:

### node-emoji (Simple conversion)

```bash
npm install node-emoji
```

```typescript
import emoji from 'node-emoji';

// Convert emoji names to Unicode
const text = "Hello :smile: world";
const converted = emoji.emojify(text);
// "Hello 😊 world"

// Get single emoji
const heart = emoji.get('heart'); // "❤️"

// Search emoji
const results = emoji.search('smile'); // Array of matching emoji
```

**Best for:** Text conversion, simple emoji insertion

### emoji-mart (Full picker UI)

```bash
npm install emoji-mart @emoji-mart/data @emoji-mart/react
```

```typescript
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

// Full-featured emoji picker component
<Picker
  data={data}
  onEmojiSelect={console.log}
  theme="auto"
  previewPosition="none"
/>
```

**Best for:** Interactive emoji pickers, UI components

### Comparison

| Feature | node-emoji | emoji-mart |
|---------|-----------|------------|
| Text conversion | ✅ Excellent | ⚠️ Manual |
| Picker UI | ❌ No | ✅ Full featured |
| Search | ✅ Basic | ✅ Advanced |
| Categories | ❌ No | ✅ Yes |
| Size | ~50KB | ~500KB |
| React required | ❌ No | ✅ Yes |

---

## Summary

**For most Slack → Zoom migrations:**
- ✅ **Don't convert emoji** - Zoom handles `:emoji_name:` natively
- ✅ **No emoji map needed** - Not included in this skill
- ❌ **Reactions not supported** - Remove from migrated app

**If you need emoji conversion:**
1. Use `node-emoji` npm package for simple conversion
2. Use `emoji-mart` for full emoji picker UI with search
3. Both packages include 1,800+ standard emoji
4. Both are actively maintained and lightweight

**Only needed when:**
- Building custom emoji picker UI
- Processing Slack export data offline
- Displaying in non-markdown contexts
- Converting legacy message formats

**Why no emoji_map.json in skill:**
- Adds 500KB to skill size
- Rarely needed (Zoom markdown handles emoji natively)
- npm packages provide better alternatives
- Keeps skill lightweight and maintainable
