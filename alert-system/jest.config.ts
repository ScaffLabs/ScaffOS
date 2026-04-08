module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    transform: {
        '^.+\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|\.(test|spec))\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};
