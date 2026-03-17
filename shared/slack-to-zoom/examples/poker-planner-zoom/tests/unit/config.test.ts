/**
 * Unit tests for configuration
 */

import { config } from '../../src/config';
import { setTestEnv, cleanupTestEnv } from '../helpers/fixtures';

describe('Configuration', () => {
  beforeEach(() => {
    setTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
  });

  describe('Zoom configuration', () => {
    it('should load Zoom credentials from environment', () => {
      expect(config.zoom.clientId).toBe('test_client_id');
      expect(config.zoom.clientSecret).toBe('test_client_secret');
      expect(config.zoom.botJid).toBe('bot@zoom.us');
      expect(config.zoom.webhookSecretToken).toBe('test_secret');
    });

    it('should use default API host', () => {
      expect(config.zoom.apiHost).toBe('https://api.zoom.us');
    });
  });

  describe('Server configuration', () => {
    it('should load port from environment', () => {
      expect(config.port).toBe('3001'); // String from env var
    });

    it('should detect test environment', () => {
      expect(config.nodeEnv).toBe('test');
    });
  });

  describe('App configuration', () => {
    it('should have default app name', () => {
      expect(config.appName).toBeDefined();
      expect(typeof config.appName).toBe('string');
    });
  });

  describe('Development mode', () => {
    it('should use development as default NODE_ENV', () => {
      delete process.env.NODE_ENV;
      // Re-import config to get updated value
      jest.resetModules();
      const { config: devConfig } = require('../../src/config');
      expect(devConfig.nodeEnv).toBe('development');
    });
  });
});
