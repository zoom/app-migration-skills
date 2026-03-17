import axios from 'axios';
import { config } from '../config';
import { ZoomTokenResponse, CachedBotToken } from '../types';

// Bot token cache
let cachedBotToken: CachedBotToken | null = null;

/**
 * Get bot token (client credentials flow)
 * Automatically cached and refreshed when expired
 */
export async function getBotToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedBotToken && cachedBotToken.expiresAt > Date.now()) {
    console.log('Using cached bot token');
    return cachedBotToken.token;
  }

  console.log('Fetching new bot token...');

  const authHeader = Buffer.from(
    `${config.zoom.clientId}:${config.zoom.clientSecret}`
  ).toString('base64');

  const response = await axios.post<ZoomTokenResponse>(
    `${config.zoom.oauthHost}/oauth/token?grant_type=client_credentials`,
    {},
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { access_token, expires_in } = response.data;

  // Cache with 5-minute buffer before expiry
  cachedBotToken = {
    token: access_token,
    expiresAt: Date.now() + (expires_in - 300) * 1000,
  };

  console.log('Bot token cached successfully');
  return access_token;
}

/**
 * Exchange authorization code for user tokens
 * NOTE: This function does NOT save tokens - you need to implement storage
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<ZoomTokenResponse> {
  const authHeader = Buffer.from(
    `${config.zoom.clientId}:${config.zoom.clientSecret}`
  ).toString('base64');

  const tokenParams = new URLSearchParams();
  tokenParams.set('grant_type', 'authorization_code');
  tokenParams.set('redirect_uri', config.zoom.redirectUri);
  tokenParams.set('code', code);

  const response = await axios.post<ZoomTokenResponse>(
    `${config.zoom.oauthHost}/oauth/token`,
    tokenParams.toString(),
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}

/**
 * Refresh user access token using refresh token
 * NOTE: This function does NOT save tokens - you need to implement storage
 */
export async function refreshUserToken(
  refreshToken: string
): Promise<ZoomTokenResponse> {
  const authHeader = Buffer.from(
    `${config.zoom.clientId}:${config.zoom.clientSecret}`
  ).toString('base64');

  const tokenParams = new URLSearchParams();
  tokenParams.set('grant_type', 'refresh_token');
  tokenParams.set('refresh_token', refreshToken);

  const response = await axios.post<ZoomTokenResponse>(
    `${config.zoom.oauthHost}/oauth/token`,
    tokenParams.toString(),
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}
