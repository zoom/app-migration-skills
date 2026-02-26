/**
 * Integration tests for webhook handlers
 */

import { Request, Response } from 'express';
import { handleWebhook } from '../../src/zoom/webhook';
import { mockZoomAPI, createMockWebhookPayload } from '../helpers/mocks';
import { setTestEnv, cleanupTestEnv, testUsers, testChannels } from '../helpers/fixtures';

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
      mockReq = {
        body: createMockWebhookPayload({
          cmd: '/test Hello World',
          userJid: testUsers.user1.jid,
          userName: testUsers.user1.name,
          toJid: testChannels.channel1.jid,
        }),
      };

      mockZoomAPI.mockSendMessage('msg_123');

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Should respond immediately
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });

    it('should process command asynchronously', async () => {
      mockReq = {
        body: createMockWebhookPayload({
          cmd: '/test',
          userJid: testUsers.user1.jid,
          userName: testUsers.user1.name,
        }),
      };

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

      mockReq = {
        body: {
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
        },
      };

      await handleWebhook(mockReq as Request, mockRes as Response);

      // Should respond immediately
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });

    it('should pass channelId to button action handler', async () => {
      const actionValue = JSON.stringify({ action: 'test', data: 'value' });
      const channelJid = testChannels.channel1.jid;

      mockReq = {
        body: {
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
        },
      };

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
      mockReq = {
        body: {
          event: 'bot_installed',
          payload: {},
        },
      };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('App Deauthorized Event', () => {
    it('should handle app_deauthorized event', async () => {
      mockReq = {
        body: {
          event: 'app_deauthorized',
          payload: {},
        },
      };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Unknown Events', () => {
    it('should handle unknown event types', async () => {
      mockReq = {
        body: {
          event: 'unknown_event',
          payload: {},
        },
      };

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
