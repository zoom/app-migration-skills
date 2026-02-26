/**
 * Integration tests for Zoom messaging
 */

import axios from 'axios';
import { sendMessage, updateMessage } from '../../src/zoom/messaging';
import { clearTokenCache } from '../../src/zoom/tokens';
import { mockZoomAPI } from '../helpers/mocks';
import { setTestEnv, cleanupTestEnv, testUsers, testChannels } from '../helpers/fixtures';

describe('Zoom Messaging', () => {
  beforeEach(() => {
    setTestEnv();
    mockZoomAPI.reset();
    clearTokenCache(); // Clear token cache before each test
  });

  afterEach(() => {
    cleanupTestEnv();
  });

  describe('sendMessage', () => {
    it('should send message with correct format', async () => {
      const spy = mockZoomAPI.mockSendMessage('msg_123');

      await sendMessage(
        testUsers.user1.jid,
        'Hello, World!',
        'acc_123'
      );

      expect(spy).toHaveBeenCalledWith(
        'https://api.zoom.us/v2/im/chat/messages',
        expect.objectContaining({
          robot_jid: 'bot@zoom.us',
          to_jid: testUsers.user1.jid,
          account_id: 'acc_123',
          user_jid: testUsers.user1.jid,
          is_markdown_support: true,
          content: expect.objectContaining({
            body: expect.arrayContaining([
              expect.objectContaining({
                type: 'message',
                text: 'Hello, World!',
              }),
            ]),
          }),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockZoomAPI.mockAPIError(400, 'Bad Request');

      try {
        await sendMessage(testUsers.user1.jid, 'Test', 'acc_123');
        fail('Expected sendMessage to throw an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBe(400);
      }
    });
  });

  describe('updateMessage', () => {
    it('should update message with correct format', async () => {
      const spy = mockZoomAPI.mockUpdateMessage();

      await updateMessage(
        'msg_123',
        {
          head: { text: 'Test App' },
          body: [{ type: 'message', text: 'Updated message' }],
        },
        'acc_123',
        testUsers.user1.jid
      );

      expect(spy).toHaveBeenCalledWith(
        'https://api.zoom.us/v2/im/chat/messages/msg_123',
        expect.objectContaining({
          robot_jid: 'bot@zoom.us',
          to_jid: testUsers.user1.jid,
          is_markdown_support: true,
          content: expect.objectContaining({
            body: expect.arrayContaining([
              expect.objectContaining({
                text: 'Updated message',
              }),
            ]),
          }),
        }),
        expect.any(Object)
      );
    });

    it('should handle update errors', async () => {
      mockZoomAPI.mockUpdateError(404, 'Message not found');

      try {
        await updateMessage(
          'invalid_id',
          {
            head: { text: 'Test' },
            body: [{ type: 'message', text: 'Test' }],
          },
          'acc_123'
        );
        fail('Expected updateMessage to throw an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('Markdown support', () => {
    it('should enable markdown support for all messages', async () => {
      const spy = mockZoomAPI.mockSendMessage();

      await sendMessage(testUsers.user1.jid, '**Bold text**', 'acc_123');

      // Check the second call (first is OAuth, second is message send)
      const callArgs = spy.mock.calls[1][1] as any;
      expect(callArgs.is_markdown_support).toBe(true);
    });
  });

  describe('Message formatting', () => {
    it('should format message body correctly', async () => {
      const spy = mockZoomAPI.mockSendMessage();

      await sendMessage(testUsers.user1.jid, 'Test message', 'acc_123');

      // Check the second call (first is OAuth, second is message send)
      const callArgs = spy.mock.calls[1][1] as any;
      expect(callArgs.content.body).toEqual([
        {
          type: 'message',
          text: 'Test message',
        },
      ]);
    });

    it('should include app name in header', async () => {
      const spy = mockZoomAPI.mockSendMessage();

      await sendMessage(testUsers.user1.jid, 'Test', 'acc_123');

      // Check the second call (first is OAuth, second is message send)
      const callArgs = spy.mock.calls[1][1] as any;
      expect(callArgs.content.head).toBeDefined();
      expect(callArgs.content.head.text).toBeDefined();
    });
  });
});
