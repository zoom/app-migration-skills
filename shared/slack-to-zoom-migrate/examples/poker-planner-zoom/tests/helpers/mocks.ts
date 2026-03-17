/**
 * Mock helpers for testing Zoom API integration
 */

import axios from 'axios';

export const mockZoomAPI = {
  /**
   * Mock successful message send
   */
  mockSendMessage: (messageId: string = 'msg_123') => {
    return jest.spyOn(axios, 'post').mockResolvedValue({
      data: { message_id: messageId },
      status: 200,
    });
  },

  /**
   * Mock successful message update
   */
  mockUpdateMessage: () => {
    return jest.spyOn(axios, 'put').mockResolvedValue({
      data: { success: true },
      status: 200,
    });
  },

  /**
   * Mock OAuth token response
   */
  mockGetToken: (token: string = 'mock_token_12345') => {
    return jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'imchat:bot',
      },
      status: 200,
    });
  },

  /**
   * Mock API error
   */
  mockAPIError: (status: number, message: string) => {
    return jest.spyOn(axios, 'post').mockRejectedValue({
      response: { status, data: { message } },
    });
  },

  /**
   * Reset all mocks
   */
  reset: () => {
    jest.restoreAllMocks();
  },
};

/**
 * Mock Zoom webhook payload
 */
export function createMockWebhookPayload(overrides?: any) {
  return {
    event: 'bot_notification',
    payload: {
      accountId: 'acc_123',
      userJid: 'user@zoom.us',
      userName: 'Test User',
      robotJid: 'bot@zoom.us',
      cmd: '/test',
      timestamp: Date.now(),
      toJid: 'channel@zoom.us',
      userId: 'user_123',
      ...overrides,
    },
  };
}

/**
 * Mock interactive message action payload
 */
export function createMockActionPayload(actionValue: string, overrides?: any) {
  return {
    event: 'interactive_message_actions',
    payload: {
      accountId: 'acc_123',
      userJid: 'user@zoom.us',
      userName: 'Test User',
      actionItem: {
        text: 'Button',
        value: actionValue,
      },
      ...overrides,
    },
  };
}
