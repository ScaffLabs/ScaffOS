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
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
    reporters: ['default', 'jest-junit'],
};
