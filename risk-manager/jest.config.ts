module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist/'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['text', 'lcov'],
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
    setupFiles: ['dotenv/config'],
    testTimeout: 10000,
    testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)?(x)', '**/?(*.)+(spec|test).(ts|tsx|js)?(x)'],
};
