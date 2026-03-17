# Code Example: Webhook Validation

## Slack

```typescript
import crypto from 'crypto';

// Initial challenge
if (body.type === 'url_verification') {
  return res.json({ challenge: body.challenge });
}

// Ongoing HMAC validation
const slackSignature = req.headers['x-slack-signature'];
const timestamp = req.headers['x-slack-request-timestamp'];

const message = `v0:${timestamp}:${rawBody}`;
const hash = crypto
  .createHmac('sha256', SLACK_SIGNING_SECRET)
  .update(message)
  .digest('hex');

if (`v0=${hash}` !== slackSignature) {
  return res.status(401).send('Invalid signature');
}
```

## Zoom

```typescript
import crypto from 'crypto';

// Initial validation
if (body.event === 'endpoint.url_validation') {
  const encryptedToken = crypto
    .createHmac('sha256', ZOOM_SECRET_TOKEN)
    .update(body.payload.plainToken)
    .digest('hex');
    
  return res.json({
    plainToken: body.payload.plainToken,
    encryptedToken
  });
}

// Ongoing HMAC validation
const zoomSignature = req.headers['x-zm-signature'];
const timestamp = req.headers['x-zm-request-timestamp'];

const message = `v0:${timestamp}:${JSON.stringify(body)}`;
const hash = crypto
  .createHmac('sha256', ZOOM_SECRET_TOKEN)
  .update(message)
  .digest('hex');

if (`v0=${hash}` !== zoomSignature) {
  return res.status(401).send('Invalid signature');
}
```

**Key:** Different validation events and message formats.

[Slack Docs](https://api.slack.com/authentication/verifying-requests-from-slack) | [Zoom Docs](https://developers.zoom.us/docs/api/webhooks/#validating-your-webhook-endpoint)
