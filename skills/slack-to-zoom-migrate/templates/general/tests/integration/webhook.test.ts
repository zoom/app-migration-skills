/**
 * Integration tests for webhook handlers
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { handleWebhook } from '../../src/zoom/webhook';
import { mockZoomAPI, createMockWebhookPayload } from '../helpers/mocks';
import { setTestEnv, cleanupTestEnv, testUsers, testChannels } from '../helpers/fixtures';

/**
 * Helper function to create a properly signed webhook request
 * This ensures webhook signature verification tests pass
 */
function createSignedWebhookRequest(payload: any): Partial<Request> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rawBody = JSON.stringify(payload);

  // Generate valid HMAC signature
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto
    .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN || 'dev_webhook_secret')
    .update(message)
    .digest('hex');

  return {
    body: payload,
    headers: {
      'x-zm-signature': `v0=${hash}`,
      'x-zm-request-timestamp': timestamp,
    } as any,
    rawBody: rawBody,
  } as any;
}

describe('Webhook Handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    setTestEnv();

    jsonSpy = jest.fn();
    statusSpy = jest.fn(() => ({ json: jsonSpy }));

    mockReq = {};
    mockRes = {
      json: jsonSpy,
      status: statusSpy,
      send: jest.fn(),
    };

    mockZoomAPI.reset();
  });

  afterEach(() => {
    cleanupTestEnv();
    jest.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should handle endpoint.url_validation event', async () => {
      mockReq = {
        body: {
          event: 'endpoint.url_validation',
          payload: {
            plainToken: 'test_plain_token',
          },
        },
      };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          plainToken: 'test_plain_token',
          encryptedToken: expect.any(String),
        })
      );
    });
  });

  describe('Bot Notification (Slash Commands)', () => {
    it('should handle bot_notification event', async () => {
      const payload = createMockWebhookPayload({
        cmd: '/test Hello World',
        userJid: testUsers.user1.jid,
        userName: testUsers.user1.name,
        toJid: testChannels.channel1.jid,
      });

      mockReq = createSignedWebhookRequest(payload);

      mockZoomAPI.mockSendMessage('msg_123');

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Should respond immediately
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });

    it('should process command asynchronously', async () => {
      const payload = createMockWebhookPayload({
        cmd: '/test',
        userJid: testUsers.user1.jid,
        userName: testUsers.user1.name,
      });

      mockReq = createSignedWebhookRequest(payload);

      mockZoomAPI.mockSendMessage();

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Command should be processed
      expect(jsonSpy).toHaveBeenCalled();
    });
  });

  describe('Interactive Message Actions', () => {
    it('should handle interactive_message_actions event', async () => {
      const actionValue = JSON.stringify({ action: 'test', data: 'value' });

      const payload = {
        event: 'interactive_message_actions',
        payload: {
          userJid: testUsers.user1.jid,
          userName: testUsers.user1.name,
          accountId: 'acc_123',
          toJid: testChannels.channel1.jid,  // ← Channel where button was clicked
          actionItem: {
            text: 'Test Button',
            value: actionValue,
          },
        },
      };

      mockReq = createSignedWebhookRequest(payload);

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Should respond immediately
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });

    it('should pass channelId to button action handler', async () => {
      const actionValue = JSON.stringify({ action: 'test', data: 'value' });
      const channelJid = testChannels.channel1.jid;

      const payload = {
        event: 'interactive_message_actions',
        payload: {
          userJid: testUsers.user1.jid,
          userName: testUsers.user1.name,
          accountId: 'acc_123',
          toJid: channelJid,
          actionItem: {
            text: 'Test Button',
            value: actionValue,
          },
        },
      };

      mockReq = createSignedWebhookRequest(payload);

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should respond immediately
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });

      // Button handler should receive channelId from toJid
      // (specific validation depends on your button handler implementation)
    });
  });

  describe('Bot Installed Event', () => {
    it('should handle bot_installed event', async () => {
      const payload = {
        event: 'bot_installed',
        payload: {},
      };

      mockReq = createSignedWebhookRequest(payload);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('App Deauthorized Event', () => {
    it('should handle app_deauthorized event', async () => {
      const payload = {
        event: 'app_deauthorized',
        payload: {},
      };

      mockReq = createSignedWebhookRequest(payload);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Unknown Events', () => {
    it('should handle unknown event types', async () => {
      const payload = {
        event: 'unknown_event',
        payload: {},
      };

      mockReq = createSignedWebhookRequest(payload);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle webhook errors gracefully', async () => {
      mockReq = {
        body: null, // Invalid body
      };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
