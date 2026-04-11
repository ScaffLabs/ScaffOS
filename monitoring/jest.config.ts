import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/dist/**', '!**/__tests__/**'],
    testTimeout: 10000,
    watchPathIgnorePatterns: ['<rootDir>/dist/'],
    watch: true,
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    reporters: [
        'default',
        ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ],
};

export default config;