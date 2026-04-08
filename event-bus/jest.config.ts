import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    transform: {
        '^.+\.ts$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|\.|/)(test|spec)\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
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