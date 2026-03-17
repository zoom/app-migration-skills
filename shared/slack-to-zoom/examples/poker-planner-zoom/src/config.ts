import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

// Helper function to get env var with development fallback
function getEnvVar(key: string, devDefault: string = ''): string {
  const value = process.env[key];

  if (!value) {
    if (isDevelopment) {
      console.warn(`⚠️  Missing ${key} - using placeholder value for development`);
      return devDefault || `<${key}_placeholder>`;
    } else {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return value;
}

export const config = {
  port: process.env.PORT || 3000,
  appName: process.env.APP_NAME || 'Zoom Chatbot',
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',

  zoom: {
    clientId: getEnvVar('ZOOM_CLIENT_ID', 'dev_client_id'),
    clientSecret: getEnvVar('ZOOM_CLIENT_SECRET', 'dev_client_secret'),
    botJid: getEnvVar('ZOOM_BOT_JID', 'dev_bot@xmpp.zoom.us'),
    webhookSecretToken: getEnvVar('ZOOM_WEBHOOK_SECRET_TOKEN', 'dev_webhook_secret'),
    apiHost: process.env.ZOOM_API_HOST || 'https://api.zoom.us',
    oauthHost: process.env.ZOOM_OAUTH_HOST || 'https://zoom.us',
    redirectUri: getEnvVar('ZOOM_REDIRECT_URI', 'http://localhost:3000/api/zoomapp/auth'),
  },
};

// Log development mode warning
if (isDevelopment && !process.env.ZOOM_CLIENT_ID) {
  console.log('\n🚧 Running in DEVELOPMENT mode with placeholder credentials');
  console.log('📝 To test with real Zoom API, copy .env.example to .env and add your credentials\n');
}
