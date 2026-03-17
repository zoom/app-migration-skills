# Code Example: OAuth Flow

## Slack (Authorization Code)

```typescript
// Step 1: Redirect to Slack
res.redirect(`https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,commands`);

// Step 2: Handle callback
const { code } = req.query;
const response = await axios.post('https://slack.com/api/oauth.v2.access', {
  client_id, client_secret, code, redirect_uri
});

// Save tokens
await db.saveTokens(response.data.access_token, response.data.refresh_token);
```

## Zoom (Client Credentials)

```typescript
// Single step: Get token
const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

const response = await axios.post(
  'https://zoom.us/oauth/token?grant_type=client_credentials',
  {},
  { headers: { Authorization: `Basic ${authHeader}` } }
);

// Cache token (1 hour lifetime)
const token = response.data.access_token;
```

**Key:** Zoom is server-to-server (no user consent needed).

[Slack Docs](https://api.slack.com/authentication/oauth-v2) | [Zoom Docs](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)
