# Code Example: Slash Commands

## Slack

```typescript
app.command('/vote', async ({ command, ack, respond }) => {
  await ack();  // Acknowledge within 3 seconds
  
  const question = command.text;  // Already parsed!
  console.log('User:', command.user_id);
  console.log('Channel:', command.channel_id);
  
  await respond({
    text: `Vote created: ${question}`,
    response_type: 'in_channel'
  });
});
```

## Zoom

```typescript
app.post('/webhooks/zoom', async (req, res) => {
  res.json({ success: true });  // Fire-and-forget
  
  if (req.body.event === 'bot_notification') {
    const { cmd, userJid, toJid, accountId } = req.body.payload;
    
    // Manual parsing
    const [command, ...args] = cmd.split(' ');
    const question = args.join(' ');
    
    console.log('Command:', command);  // "/vote"
    console.log('User:', userJid);
    console.log('Channel:', toJid);
    
    // Respond via messaging API
    await sendMessage({
      to_jid: toJid,
      text: `Vote created: ${question}`
    });
  }
});
```

**Key:** Zoom requires manual command parsing and async response.

[Slack Docs](https://api.slack.com/interactivity/slash-commands) | [Zoom Docs](https://developers.zoom.us/docs/team-chat/chatbot/extend/slash-commands-in-Zoom/)
