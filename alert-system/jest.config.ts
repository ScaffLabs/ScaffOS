module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    transform: {
        '^.+\.(ts|tsx)$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(.|/)(test|spec))\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['text', 'lcov'],
};
