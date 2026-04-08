import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};

export default config;
