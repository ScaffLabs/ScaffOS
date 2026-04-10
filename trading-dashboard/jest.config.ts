module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\.(ts|tsx)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            lines: 90,
            functions: 90,
            branches: 90,
            statements: 90,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
    reporters: ['default', 'jest-junit'],
};
