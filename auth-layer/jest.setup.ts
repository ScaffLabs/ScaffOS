import dotenv from 'dotenv';
dotenv.config();

jest.mock('./apiKey', () => ({
    validateApiKey: jest.fn((key) => key === 'valid_api_key'),
}));

jest.mock('./storage', () => ({
    createUser: jest.fn((username, email) => ({ id: 'testId', username, email })),
    findUserByEmail: jest.fn().mockImplementation((email) => {
        const users = [
            { id: '1', username: 'testuser1', email: 'test1@example.com' },
            { id: '2', username: 'testuser2', email: 'test2@example.com' }
        ];
        return users.find(user => user.email === email) || null;
    }),
}));

jest.mock('./jwt', () => ({
    generateToken: jest.fn().mockReturnValue('valid_token'),
    verifyToken: jest.fn((token) => {
        if (token === 'invalid_token') throw new Error('Invalid token');
        return { userId: 'testId' };
    }),
}));

jest.mock('./logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

jest.mock('./interServiceClient', () => ({
    checkUserServiceHealth: jest.fn().mockResolvedValue(true),
    checkOrderServiceHealth: jest.fn().mockResolvedValue(true),
}));

jest.setTimeout(30000); // Set timeout for integration tests.