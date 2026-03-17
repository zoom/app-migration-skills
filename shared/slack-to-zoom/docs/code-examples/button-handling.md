# Code Example: Button Handling

## Slack

```typescript
app.action('button_click', async ({ action, ack }) => {
  await ack();
  console.log('Button value:', action.value);  // "button_value"
});
```

## Zoom

```typescript
if (body.event === 'interactive_message_actions') {
  const { actionItem } = body.payload;
  const data = JSON.parse(actionItem.value);
  console.log('Button action:', data.action);  // "button_click"
  console.log('Button data:', data.data);      // "button_value"
}
```

**Key:** Zoom button values are JSON-stringified objects.

[Slack Docs](https://api.slack.com/interactivity/handling) | [Zoom Docs](https://developers.zoom.us/docs/team-chat/chatbot/webhooks/#interactive_message_actions)
