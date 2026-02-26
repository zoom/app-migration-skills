module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],

  // By default, exclude E2E tests (they make real API calls)
  // Run E2E tests explicitly with: npm run test:e2e
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/', // Exclude E2E tests from default runs
  ],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts', // Exclude server entry point
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Increased timeout for slower integration tests
  // E2E tests override this per-test when needed
  testTimeout: 10000,
};
