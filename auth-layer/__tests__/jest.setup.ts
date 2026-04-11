import dotenv from 'dotenv';
dotenv.config();

jest.mock('./apiKey', () => ({
    validateApiKey: jest.fn((key) => key === 'valid_api_key'),
}));

jest.mock('./storage', () => ({
    createUser: jest.fn(async (username, email) => ({ id: 'testId', username, email })),
    findUserById: jest.fn().mockImplementation((id) => {
        if (id === 'testId') return { id, username: 'testuser', email: 'test@example.com' };
        return null;
    }),
    updateUser: jest.fn().mockImplementation((id, userData) => {
        if (id === 'testId') return { ...userData, id };
        throw new Error('User not found');
    }),
    deleteUser: jest.fn().mockImplementation((id) => {
        if (id === 'testId') return true;
        return false;
    }),
    getAllUsers: jest.fn().mockReturnValue([{ id: 'testId', username: 'testuser', email: 'test@example.com' }]),
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

jest.setTimeout(30000); // Set timeout for integration tests.