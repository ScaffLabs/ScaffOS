import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\.(ts|tsx)$': 'ts-jest',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

export default config;