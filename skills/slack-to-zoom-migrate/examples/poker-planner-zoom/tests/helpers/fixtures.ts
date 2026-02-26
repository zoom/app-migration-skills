/**
 * Test fixtures for common test data
 */

/**
 * Sample user data
 */
export const testUsers = {
  user1: {
    jid: 'user1@zoom.us',
    name: 'Alice',
    id: 'user_001',
  },
  user2: {
    jid: 'user2@zoom.us',
    name: 'Bob',
    id: 'user_002',
  },
  user3: {
    jid: 'user3@zoom.us',
    name: 'Charlie',
    id: 'user_003',
  },
};

/**
 * Sample channel data
 */
export const testChannels = {
  channel1: {
    jid: 'channel1@zoom.us',
    name: 'general',
    id: 'ch_001',
  },
  channel2: {
    jid: 'channel2@zoom.us',
    name: 'dev-team',
    id: 'ch_002',
  },
};

/**
 * Sample account data
 */
export const testAccounts = {
  account1: {
    id: 'acc_123',
    name: 'Test Company',
  },
};

/**
 * Sample bot data
 */
export const testBot = {
  jid: 'bot@zoom.us',
  name: 'Test Bot',
};

/**
 * Environment variables for testing
 */
export const testEnv = {
  ZOOM_CLIENT_ID: 'test_client_id',
  ZOOM_CLIENT_SECRET: 'test_client_secret',
  ZOOM_BOT_JID: 'bot@zoom.us',
  ZOOM_WEBHOOK_SECRET_TOKEN: 'test_secret',
  PORT: '3001',
  NODE_ENV: 'test',
};

/**
 * Set test environment variables
 */
export function setTestEnv() {
  Object.entries(testEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

/**
 * Clean up test environment
 */
export function cleanupTestEnv() {
  Object.keys(testEnv).forEach((key) => {
    delete process.env[key];
  });
}
