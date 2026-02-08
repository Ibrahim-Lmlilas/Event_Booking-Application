const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../../shared/$1',
    '^\\./user\\.types\\.js$': '<rootDir>/../../shared/types/user.types.ts',
    '^\\./event\\.types\\.js$': '<rootDir>/../../shared/types/event.types.ts',
    '^\\./reservation\\.types\\.js$': '<rootDir>/../../shared/types/reservation.types.ts',
    '^\\./ticket\\.types\\.js$': '<rootDir>/../../shared/types/ticket.types.ts',
    '^\\./ui\\.types\\.js$': '<rootDir>/../../shared/types/ui.types.ts',
    '^\\.\\./enums/index\\.js$': '<rootDir>/../../shared/enums/index.ts',
    '^\\./user-role\\.enum\\.js$': '<rootDir>/../../shared/enums/user-role.enum.ts',
    '^\\./event-status\\.enum\\.js$': '<rootDir>/../../shared/enums/event-status.enum.ts',
    '^\\./reservation-status\\.enum\\.js$': '<rootDir>/../../shared/enums/reservation-status.enum.ts',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testTimeout: 15000, // Increase default timeout for async tests
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
