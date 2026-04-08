import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    transform: {
        '^.+\.ts$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|\.|/)(test|spec)\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;
