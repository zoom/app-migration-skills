import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';
import { exchangeCodeForTokens } from './tokens';

/**
 * OAuth callback handler
 * Handles the redirect from Zoom after user authorizes the app
 */
export async function handleOAuthCallback(req: Request, res: Response) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    console.error('OAuth callback missing code parameter');
    return res.status(400).send('Missing authorization code');
  }

  try {
    console.log('OAuth callback received, exchanging code for tokens...');

    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code);
    console.log('Successfully exchanged code for tokens');

    // TODO: Save tokens if you need user-level API access
    // Example: await saveUserTokens(tokenData);

    // Get deep link to redirect user back to Zoom app
    const deepLinkResponse = await axios.post(
      `${config.zoom.apiHost}/v2/zoomapp/deeplink`,
      { action: 'go' },
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (deepLinkResponse.data?.deeplink) {
      console.log('Redirecting user back to Zoom app');
      return res.redirect(deepLinkResponse.data.deeplink);
    }

    // Fallback: show success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>App Installed</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center; }
            .success { color: #16a34a; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="success">✅</div>
          <h1>${config.appName} Installed Successfully!</h1>
          <p>Your bot is now active. You can close this window and start messaging your bot in Zoom Team Chat.</p>
          <p>Send a message to get started!</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).send('Installation failed');
  }
}
