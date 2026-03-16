# OAuth & Authentication Deep Dive
## Slack OAuth vs Zoom Client Credentials

**Status:** Production Ready
**Compatibility:** 100% ✅ (Different Flow)
**Last Updated:** 2026-02-18

---

## Flow Comparison

| Aspect | Slack | Zoom |
|--------|-------|------|
| OAuth Type | Authorization Code | Client Credentials |
| User Consent | Required | Not required (server-to-server) |
| Refresh Token | Yes | No (re-authenticate) |
| Token Lifetime | 12+ hours | 1 hour |
| Documentation | [Slack OAuth](https://api.slack.com/authentication/oauth-v2) | [Zoom OAuth](https://developers.zoom.us/docs/internal-apps/s2s-oauth/) |

---

## Slack: Authorization Code Flow

### Step 1: Redirect to Slack

```
https://slack.com/oauth/v2/authorize?
  client_id={CLIENT_ID}&
  scope={SCOPES}&
  redirect_uri={REDIRECT_URI}&
  state={STATE}
```

### Step 2: Exchange Code for Token

```typescript
const response = await axios.post('https://slack.com/api/oauth.v2.access', {
  client_id: process.env.SLACK_CLIENT_ID,
  client_secret: process.env.SLACK_CLIENT_SECRET,
  code: authCode,
  redirect_uri: process.env.REDIRECT_URI,
  grant_type: 'authorization_code'
});

// Response:
{
  access_token: "xoxb-...",
  refresh_token: "xoxe-...",
  expires_in: 43200,
  bot_user_id: "U123"
}
```

### Step 3: Refresh Token

```typescript
const response = await axios.post('https://slack.com/api/oauth.v2.access', {
  client_id: process.env.SLACK_CLIENT_ID,
  client_secret: process.env.SLACK_CLIENT_SECRET,
  refresh_token: storedRefreshToken,
  grant_type: 'refresh_token'
});
```

---

## Zoom: Client Credentials Flow

### Single Step: Get Token

```typescript
const authHeader = Buffer.from(
  `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
).toString('base64');

const response = await axios.post(
  'https://zoom.us/oauth/token?grant_type=client_credentials',
  {},
  {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);

// Response:
{
  access_token: "eyJ...",
  token_type: "bearer",
  expires_in: 3600
}
```

### Token Refresh

```typescript
// No refresh token - just re-authenticate
if (tokenExpired()) {
  const newToken = await getBotToken();  // Same flow
}
```

---

## Token Caching Example

### Zoom Token Manager

```typescript
interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export async function getBotToken(): Promise<string> {
  // Return cached token if valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  // Get new token
  const authHeader = Buffer.from(
    `${config.zoom.clientId}:${config.zoom.clientSecret}`
  ).toString('base64');

  const response = await axios.post(
    `${config.zoom.oauthHost}/oauth/token?grant_type=client_credentials`,
    {},
    { headers: { Authorization: `Basic ${authHeader}` } }
  );

  // Cache with 5-minute buffer
  cachedToken = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in - 300) * 1000
  };

  return cachedToken.token;
}
```

---

## Scope Mapping

### Slack Scopes

**Documentation:** [OAuth Scopes](https://api.slack.com/scopes)

Common bot scopes:
- `chat:write` - Send messages
- `chat:write.customize` - Customize bot appearance
- `commands` - Add slash commands
- `users:read` - View workspace users
- `channels:read` - View channels
- `im:history` - View DM messages

### Zoom Scopes

**Documentation:** [Team Chat Scopes](https://developers.zoom.us/docs/integrations/oauth-scopes/)

Single scope:
- `imchat:bot` - All bot functionality

**Key Difference:** Zoom uses one omnibus scope; Slack has granular scopes.

---

## Migration Checklist

- [ ] Remove OAuth redirect flow (user consent not needed)
- [ ] Remove refresh token logic
- [ ] Implement client credentials flow
- [ ] Add token caching (shorter lifetime)
- [ ] Update token refresh to re-authenticate (not refresh)
- [ ] Simplify scope requirements (`imchat:bot` only)
- [ ] Remove user-level token management
- [ ] Update .env.example with new OAuth vars
- [ ] Test token expiration handling
- [ ] Document new OAuth flow in README

---

## See Also

- [API Mapping Reference](../API_MAPPING_REFERENCE.md#5-oauth--authentication)
- [Code Example: OAuth Flow](../code-examples/oauth-flow.md)
- [Zoom OAuth Docs](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)
