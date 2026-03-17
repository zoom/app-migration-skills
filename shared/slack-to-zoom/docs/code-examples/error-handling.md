# Code Example: Error Handling

## Slack

```typescript
try {
  await client.chat.postMessage({ channel, text });
} catch (error) {
  if (error.data?.error === 'not_in_channel') {
    // Bot not in channel
  } else if (error.data?.error === 'channel_not_found') {
    // Channel doesn't exist
  } else if (error.data?.error === 'ratelimited') {
    const retryAfter = error.data.retry_after;
    // Wait and retry
  }
}
```

## Zoom

```typescript
try {
  await axios.post('/v2/im/chat/messages', data);
} catch (error) {
  if (error.response?.status === 404) {
    // Channel not found
  } else if (error.response?.status === 429) {
    // Rate limited
  } else if (error.response?.status === 401) {
    // Token expired - refresh
    const newToken = await getBotToken();
  }
}
```

**Key:** Different error codes and structures.

[Slack Errors](https://api.slack.com/docs/error-handling) | [Zoom Errors](https://developers.zoom.us/docs/api/errors/)
