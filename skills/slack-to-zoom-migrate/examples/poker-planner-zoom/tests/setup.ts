/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.ZOOM_CLIENT_ID = 'test_client_id';
process.env.ZOOM_CLIENT_SECRET = 'test_client_secret';
process.env.ZOOM_BOT_JID = 'bot@zoom.us';
process.env.ZOOM_WEBHOOK_SECRET_TOKEN = 'test_secret';
process.env.ZOOM_REDIRECT_URI = 'http://localhost:3001/api/zoomapp/auth';
process.env.PORT = '3001';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

// Increase timeout for integration tests
jest.setTimeout(10000);
