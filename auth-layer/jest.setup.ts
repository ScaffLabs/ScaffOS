import dotenv from 'dotenv';
dotenv.config();

jest.mock('./apiKey', () => ({
    validateApiKey: jest.fn((key) => key === 'valid_api_key'),
}));

jest.mock('./storage', () => ({
    createUser: jest.fn((username, email) => ({ id: 'testId', username, email })),
}));
