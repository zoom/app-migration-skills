/**
 * Mock helpers for testing Zoom API integration
 */

import { httpClient } from '../../src/zoom/http-client';

export const mockZoomAPI = {
  /**
   * Mock successful message send
   * Handles both OAuth token call and message send
   */
  mockSendMessage: (messageId: string = 'msg_123') => {
    const postSpy = jest.spyOn(httpClient, 'post');

    // First call: OAuth token
    postSpy.mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_12345',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'imchat:bot',
      },
      status: 200,
    });

    // Second call: Send message
    postSpy.mockResolvedValueOnce({
      data: { message_id: messageId },
      status: 200,
    });

    return postSpy;
  },

  /**
   * Mock successful message update
   * Handles both OAuth token call and message update
   */
  mockUpdateMessage: () => {
    // Mock OAuth token call
    jest.spyOn(httpClient, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_12345',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'imchat:bot',
      },
      status: 200,
    });

    // Mock message update
    const putSpy = jest.spyOn(httpClient, 'put').mockResolvedValueOnce({
      data: { success: true },
      status: 200,
    });

    return putSpy;
  },

  /**
   * Mock OAuth token response only
   */
  mockGetToken: (token: string = 'mock_token_12345') => {
    return jest.spyOn(httpClient, 'post').mockResolvedValue({
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
   * Mock API error for message sending
   */
  mockAPIError: (status: number, message: string) => {
    const postSpy = jest.spyOn(httpClient, 'post');

    // First call: OAuth token succeeds
    postSpy.mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_12345',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'imchat:bot',
      },
      status: 200,
    });

    // Second call: Message API fails
    postSpy.mockRejectedValueOnce({
      response: {
        status,
        data: { message },
      },
      message: message,
    });

    return postSpy;
  },

  /**
   * Mock API error for message update
   */
  mockUpdateError: (status: number, message: string) => {
    // OAuth token succeeds
    jest.spyOn(httpClient, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'mock_token_12345',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'imchat:bot',
      },
      status: 200,
    });

    // Update fails
    const putSpy = jest.spyOn(httpClient, 'put').mockRejectedValueOnce({
      response: {
        status,
        data: { message },
      },
      message: message,
    });

    return putSpy;
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
