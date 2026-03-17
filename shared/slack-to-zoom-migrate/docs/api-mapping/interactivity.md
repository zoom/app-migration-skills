# Interactive Components Deep Dive
## Slack Block Kit vs Zoom Interactive Messages

**Status:** Production Ready
**Compatibility:** 75% ⚠️
**Last Updated:** 2026-02-18

---

## Overview

Slack offers rich Block Kit with 20+ interactive components. Zoom supports buttons only.

---

## Component Support Matrix

| Component | Slack | Zoom | Compatibility |
|-----------|-------|------|---------------|
| Buttons | ✅ | ✅ | 100% ✅ |
| Select menus | ✅ | ❌ | 0% ❌ |
| Multi-select | ✅ | ❌ | 0% ❌ |
| Date picker | ✅ | ❌ | 0% ❌ |
| Time picker | ✅ | ❌ | 0% ❌ |
| Checkboxes | ✅ | ❌ | 0% ❌ |
| Radio buttons | ✅ | ❌ | 0% ❌ |
| Text input | ✅ | ❌ | 0% ❌ |
| Number input | ✅ | ❌ | 0% ❌ |
| Modals | ✅ | ⚠️ Inline only | 30% ⚠️ |

**Documentation:**
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Zoom Interactive Messages](https://developers.zoom.us/docs/team-chat/customizing-messages/)

---

## Buttons

### Slack Button

```typescript
{
  type: "actions",
  elements: [{
    type: "button",
    text: { type: "plain_text", text: "Approve" },
    action_id: "approve_request",
    value: "req_123",
    style: "primary"  // primary, danger, or omit
  }]
}
```

### Zoom Button

```typescript
{
  type: "actions",
  items: [{
    text: "Approve",
    value: JSON.stringify({
      action: "approve_request",
      request_id: "req_123"
    }),
    style: "Primary"  // Default, Primary, Danger
  }]
}
```

### Key Differences

| Aspect | Slack | Zoom |
|--------|-------|------|
| Value | Simple string | Must be JSON-stringified |
| Text | Object with type | Plain string |
| Action ID | Separate field | Inside value JSON |
| Styles | `primary`, `danger` | `Primary`, `Danger`, `Default` |

---

## Select Menus → Button Workaround

### Slack: Select Menu

```typescript
{
  type: "actions",
  elements: [{
    type: "static_select",
    placeholder: { type: "plain_text", text: "Choose option" },
    options: [
      { text: { type: "plain_text", text: "Option 1" }, value: "opt_1" },
      { text: { type: "plain_text", text: "Option 2" }, value: "opt_2" },
      { text: { type: "plain_text", text: "Option 3" }, value: "opt_3" }
    ],
    action_id: "select_option"
  }]
}
```

### Zoom: Button Array Workaround

```typescript
{
  type: "message",
  text: "Choose an option:"
},
{
  type: "actions",
  items: [
    {
      text: "Option 1",
      value: JSON.stringify({ action: "select_option", value: "opt_1" }),
      style: "Default"
    },
    {
      text: "Option 2",
      value: JSON.stringify({ action: "select_option", value: "opt_2" }),
      style: "Default"
    },
    {
      text: "Option 3",
      value: JSON.stringify({ action: "select_option", value: "opt_3" }),
      style: "Default"
    }
  ]
}
```

**Limitation:** Less compact, no search functionality.

---

## Modals vs Sequential Messages

### Slack: Modal

```typescript
await client.views.open({
  trigger_id: "12345",
  view: {
    type: "modal",
    title: { type: "plain_text", text: "Create Issue" },
    submit: { type: "plain_text", text: "Create" },
    blocks: [
      {
        type: "input",
        block_id: "title",
        element: { type: "plain_text_input", action_id: "title_input" },
        label: { type: "plain_text", text: "Title" }
      },
      {
        type: "input",
        block_id: "description",
        element: { type: "plain_text_input", multiline: true, action_id: "desc_input" },
        label: { type: "plain_text", text: "Description" }
      }
    ]
  }
});
```

### Zoom: Sequential Messages

```typescript
// Step 1: Ask for title
await sendMessage({
  text: "Let's create an issue. What's the title?",
  body: [{
    type: "actions",
    items: [{ text: "Cancel", value: JSON.stringify({ action: "cancel" }) }]
  }]
});

// Store state: awaiting_title
await db.setState(userId, { step: "awaiting_title" });

// When user responds (via another slash command or message):
// Step 2: Ask for description
await sendMessage({
  text: "Great! Now provide a description:",
  body: [...]
});

// Continue flow...
```

**Limitation:** No native form, requires state management.

---

## Migration Checklist

- [ ] Replace select menus with button arrays
- [ ] Convert modals to sequential message flows
- [ ] JSON-stringify button values
- [ ] Add state management for multi-step flows
- [ ] Remove text inputs (capture via slash commands)
- [ ] Remove date/time pickers (use text input with validation)
- [ ] Simplify UI (fewer components available)
- [ ] Test button click handling
- [ ] Update action_id extraction (from JSON value)

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md#3-interactive-components)
- [Code Example: Button Handling](../code-examples/button-handling.md)
- [Formatting Guide](formatting.md)
