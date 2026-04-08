module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\.tsx?$': 'ts-jest',
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
};