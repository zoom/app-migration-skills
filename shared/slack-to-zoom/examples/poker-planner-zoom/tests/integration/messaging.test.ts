/**
 * Integration tests for Zoom messaging
 */

import axios from 'axios';
import { sendMessage, updateMessage } from '../../src/zoom/messaging';
import { mockZoomAPI } from '../helpers/mocks';
import { setTestEnv, cleanupTestEnv, testUsers, testChannels } from '../helpers/fixtures';

describe('Zoom Messaging', () => {
  beforeEach(() => {
    setTestEnv();
    mockZoomAPI.reset();
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

      await expect(
        sendMessage(testUsers.user1.jid, 'Test', 'acc_123')
      ).rejects.toThrow();
    });
  });

  describe('updateMessage', () => {
    it('should update message with correct format', async () => {
      const spy = mockZoomAPI.mockUpdateMessage();

      await updateMessage(
        'msg_123',
        testUsers.user1.jid,
        'Updated message',
        'acc_123'
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
      mockZoomAPI.mockAPIError(404, 'Message not found');

      await expect(
        updateMessage('invalid_id', testUsers.user1.jid, 'Test', 'acc_123')
      ).rejects.toThrow();
    });
  });

  describe('Markdown support', () => {
    it('should enable markdown support for all messages', async () => {
      const spy = mockZoomAPI.mockSendMessage();

      await sendMessage(testUsers.user1.jid, '**Bold text**', 'acc_123');

      const callArgs = spy.mock.calls[0][1] as any;
      expect(callArgs.is_markdown_support).toBe(true);
    });
  });

  describe('Message formatting', () => {
    it('should format message body correctly', async () => {
      const spy = mockZoomAPI.mockSendMessage();

      await sendMessage(testUsers.user1.jid, 'Test message', 'acc_123');

      const callArgs = spy.mock.calls[0][1] as any;
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

      const callArgs = spy.mock.calls[0][1] as any;
      expect(callArgs.content.head).toBeDefined();
      expect(callArgs.content.head.text).toBeDefined();
    });
  });
});
