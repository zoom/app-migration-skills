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

// Auto-detect Zoom environment from Bot JID
function detectZoomEnvironment(botJid: string): { apiHost: string; oauthHost: string } {
  const isDevEnvironment = botJid.includes('@xmppdev.zoom.us');

  if (isDevEnvironment) {
    return {
      apiHost: 'https://zoomdev.us',
      oauthHost: 'https://zoomdev.us',
    };
  } else {
    return {
      apiHost: 'https://api.zoom.us',
      oauthHost: 'https://zoom.us',
    };
  }
}

const botJid = getEnvVar('ZOOM_BOT_JID', 'dev_bot@xmpp.zoom.us');
const autoDetectedHosts = detectZoomEnvironment(botJid);

export const config = {
  port: process.env.PORT || 3000,
  appName: process.env.APP_NAME || 'Zoom Chatbot',
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',

  zoom: {
    clientId: getEnvVar('ZOOM_CLIENT_ID', 'dev_client_id'),
    clientSecret: getEnvVar('ZOOM_CLIENT_SECRET', 'dev_client_secret'),
    botJid: botJid,
    webhookSecretToken: getEnvVar('ZOOM_WEBHOOK_SECRET_TOKEN', 'dev_webhook_secret'),
    // Auto-detect from Bot JID, but allow manual override
    apiHost: process.env.ZOOM_API_HOST || autoDetectedHosts.apiHost,
    oauthHost: process.env.ZOOM_OAUTH_HOST || autoDetectedHosts.oauthHost,
    redirectUri: getEnvVar('ZOOM_REDIRECT_URI', 'http://localhost:3000/api/zoomapp/auth'),
  },
};

// Log environment detection
const detectedEnv = botJid.includes('@xmppdev.zoom.us') ? 'DEVELOPMENT (zoomdev.us)' : 'PRODUCTION (zoom.us)';
console.log(`🔍 Detected Zoom environment: ${detectedEnv}`);
console.log(`📡 API Host: ${config.zoom.apiHost}`);
console.log(`🔐 OAuth Host: ${config.zoom.oauthHost}`);

// Log development mode warning
if (isDevelopment && !process.env.ZOOM_CLIENT_ID) {
  console.log('\n🚧 Running in DEVELOPMENT mode with placeholder credentials');
  console.log('📝 To test with real Zoom API, copy .env.example to .env and add your credentials\n');
}
