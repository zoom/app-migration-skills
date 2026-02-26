import express from 'express';
import { config } from './config';
import { handleOAuthCallback } from './zoom/auth';
import { handleWebhook } from './zoom/webhook';

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', bot: config.appName });
});

// OAuth callback endpoint
app.get('/api/zoomapp/auth', handleOAuthCallback);

// Webhook endpoint
app.post('/webhooks/zoom', handleWebhook);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 ${config.appName} listening on port ${config.port}`);
  console.log(`📝 OAuth callback: http://localhost:${config.port}/api/zoomapp/auth`);
  console.log(`🪝 Webhook endpoint: http://localhost:${config.port}/webhooks/zoom`);
});
