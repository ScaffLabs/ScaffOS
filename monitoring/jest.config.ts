import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/dist/**'],
    testTimeout: 10000,
    watchPathIgnorePatterns: ['<rootDir>/dist/'],
    watch: true,
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};

export default config;