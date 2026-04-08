# Official Zoom Documentation References

## ⚠️ CRITICAL: Use These Official Docs as Source of Truth

Always refer to official Zoom documentation when implementing features. This file contains direct links to all relevant Zoom Team Chat and Chatbot API documentation.

---

## Message Formatting

### Markdown Support
**Primary Reference:** [Markdown Documentation](https://developers.zoom.us/docs/team-chat/customizing-messages/markdown/)

**Key Points:**
- Bold: `*text*` (single asterisk, NOT double)
- Italic: `_text_` (underscore)
- Strikethrough: `~text~` (single tilde, NOT double)
- Code: `` `text` ``
- Links: `<https://example.com>`
- **CRITICAL:** Set `"is_markdown_support": true` in message body

**Supported Markdown:**
| Style | Syntax | Where Supported |
|-------|--------|-----------------|
| Bold | `*text*` | Headers, subheaders, text, form fields |
| Italic | `_text_` | Headers, subheaders, text, form fields |
| Strikethrough | `~text~` | Headers, subheaders, text, form fields |
| Monospace | `` `text` `` | Headers, subheaders, text, form fields |
| Block Quote | `> text` | Headers, subheaders, text, form fields |
| Link | `<https://example.com>` | Headers, subheaders, text, form fields, footers |
| Chat Link | `<#{jid}|Name>` | Headers, subheaders, text, form fields |
| Profile Card | `<profile:{jid}|Name>` | Headers, subheaders, text, form fields |
| Mention All | `<!all>` | Headers, subheaders, text, form fields |
| Mention User | `<!jid|Name>` | Headers, subheaders, text, form fields |
| Image | `<img:URL|alt>` | Headers, subheaders, text, form fields |

---

## Customizing Messages

### Main Documentation
**Primary Reference:** [Customize Chatbot Messages](https://developers.zoom.us/docs/team-chat/customizing-messages/)

**Message Structure:**
```json
{
  "robot_jid": "bot@xmpp.zoom.us",
  "to_jid": "recipient_jid",
  "account_id": "account_id",
  "user_jid": "user_jid",
  "is_markdown_support": true,
  "content": {
    "head": {
      "text": "Header Text"
    },
    "body": [
      {
        "type": "message",
        "text": "Message content"
      }
    ]
  }
}
```

**Six Body Types:**
1. `message` - Text content
2. `actions` - Interactive buttons
3. `fields` - Form fields
4. `select` - Dropdown menus
5. `attachments` - File attachments
6. `section` - Sections with multiple elements

**Text Styling (Alternative to Markdown):**
- `color`: Hex color code
- `bold`: Boolean
- `italic`: Boolean
- **NOTE:** Cannot use both `style` object and markdown simultaneously

---

## Buttons and Interactive Elements

### Buttons Documentation
**Primary Reference:** [Buttons](https://developers.zoom.us/docs/team-chat/customizing-messages/buttons/)

**Button Structure:**
```json
{
  "type": "actions",
  "items": [
    {
      "text": "Button Label",
      "value": "button_command",
      "style": "Primary"
    }
  ]
}
```

**Four Button Styles:**
- `Primary` - Blue button (use for primary actions)
- `Default` - White button (use for secondary actions)
- `Danger` - Red button (use for destructive actions)
- `Disabled` - Gray, non-clickable button

**Overflow Handling:**
Use `limit` key to specify how many buttons show before creating a dropdown menu.

---

## Chatbot Message Cards

### Message Cards Documentation
**Primary Reference:** [Chatbot Message Cards](https://developers.zoom.us/docs/team-chat/chatbot/extend/bot-cards/)

**Three Card Types:**
1. **Markdown Messages** - Rich text with formatting
2. **Interactive Messages** - UI elements that trigger webhooks
3. **Rich Messages** - Styled text with `style` objects

**Example Interactive Message:**
```json
{
  "content": {
    "head": {
      "text": "Interactive Card"
    },
    "body": [
      {
        "type": "message",
        "text": "*Welcome!* Choose an option:"
      },
      {
        "type": "actions",
        "items": [
          {
            "text": "Option 1",
            "value": "opt1",
            "style": "Primary"
          },
          {
            "text": "Option 2",
            "value": "opt2",
            "style": "Default"
          }
        ]
      }
    ]
  }
}
```

---

## API References

### Chatbot API
**Primary Reference:** [Chatbot APIs](https://developers.zoom.us/docs/api/chatbot/)

**Key Endpoints:**
- `POST /v2/im/chat/messages` - Send a message
- `PUT /v2/im/chat/messages/{messageId}` - Update a message
- `DELETE /v2/im/chat/messages/{messageId}` - Delete a message

**Full API Reference:** [Zoom Chatbot API Methods](https://developers.zoom.us/docs/api/rest/reference/chatbot/methods/)

### Team Chat API
**Primary Reference:** [Team Chat APIs](https://developers.zoom.us/docs/api/team-chat/)

**Full API Reference:** [Zoom Team Chat API Methods](https://developers.zoom.us/docs/api/rest/reference/chat/methods/)

---

## Webhooks

### Chatbot Webhooks
**Primary Reference:** [Chatbot Webhooks](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/)

**Webhook Events:**
- `bot_notification` - Slash commands and direct messages
- `interactive_message_select` - Dropdown selections
- `interactive_message_actions` - Button clicks
- `interactive_message_editable` - Form field edits
- `interactive_message_fields_editable` - Multiple field edits

**Webhook Validation:**
Use HMAC SHA256 to verify webhook authenticity with your webhook secret token.

---

## Tutorials and Guides

### Getting Started
- [Create a Chatbot for Team Chat](https://developers.zoom.us/docs/team-chat/create-chatbot/)
- [Chatbot Tutorial](https://developers.zoom.us/docs/team-chat-apps/chatbot-tutorial/)

### Testing and Development
- [Using Postman to Test Zoom Chat Apps](https://developers.zoom.us/docs/api/rest/postman/using-postman-to-test-zoom-chatbots/)
- **Postman Collection:** [Zoom Chatbot API Endpoints](https://www.postman.com/zoom-developer/zoom-public-workspace/collection/lqg4ib9/zoom-chatbot-api-endpoints)

---

## Migration from Slack

### Block Kit to Zoom Cards
**Recommendation:** Use both builders side-by-side:
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- Zoom Chatbot Card Builder (referenced in Zoom docs)

**Key Differences:**
1. **Markdown Syntax:**
   - Slack uses `*bold*` and `_italic_`
   - Zoom uses `*bold*` and `_italic_` (SAME!)
   - But Slack also supports `**bold**` and `__underline__` which Zoom does NOT

2. **Layout:**
   - Slack has complex Block Kit with sections, accessories, dividers
   - Zoom uses simpler body array with types

3. **Styling:**
   - Slack embeds all styling in blocks
   - Zoom separates: markdown OR style objects (not both)

---

## Common Pitfalls

### ❌ WRONG Markdown (GitHub-style)
```typescript
text: "**Bold** and ~~strikethrough~~"  // Won't work in Zoom!
```

### ✅ CORRECT Markdown (Zoom/Slack-style)
```typescript
text: "*Bold* and ~strikethrough~"  // Works in Zoom!
```

### ❌ WRONG: Mixing Markdown and Style
```json
{
  "type": "message",
  "text": "*Bold text*",
  "style": {
    "bold": true  // Conflicts with markdown!
  }
}
```

### ✅ CORRECT: Choose One Approach
```json
{
  "type": "message",
  "text": "*Bold text*",
  "is_markdown_support": true  // Use markdown
}
```

OR

```json
{
  "type": "message",
  "text": "Bold text",
  "style": {
    "bold": true  // Use style object
  }
}
```

---

## Quick Links

**Main Developer Portal:** https://developers.zoom.us/

**Documentation Sections:**
- [Team Chat](https://developers.zoom.us/docs/team-chat/)
- [Chatbot](https://developers.zoom.us/docs/team-chat/chatbot/)
- [API Reference](https://developers.zoom.us/docs/api/)

**Community and Support:**
- [Zoom Developer Forum](https://devforum.zoom.us/)
- [Zoom Community - Team Chat](https://community.zoom.com/t5/Zoom-Team-Chat/bd-p/ZoomChat)

---

## Update History

- **2026-02-19:** Initial creation with comprehensive Zoom documentation links
- Added critical markdown syntax corrections (single asterisk for bold, not double)
- Added all official API references and webhook documentation
- Added common pitfalls and migration notes

---

**Always check official Zoom documentation for the latest updates and changes!**
