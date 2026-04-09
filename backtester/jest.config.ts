export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  globalSetup: './globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};