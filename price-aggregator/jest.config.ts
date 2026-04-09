import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    transform: {
        '^.+\.tsx?$': 'ts-jest',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
