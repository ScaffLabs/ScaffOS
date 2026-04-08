import { generateApiKey, validateApiKey, getUserIdFromApiKey } from '../apiKey';

describe('API Key Functions', () => {
    it('should generate a valid API key', () => {
        const userId = 'user123';
        const apiKey = generateApiKey(userId);
        expect(apiKey).toHaveLength(32);
    });

    it('should validate a valid API key', () => {
        const userId = 'user123';
        const apiKey = generateApiKey(userId);
        expect(validateApiKey(apiKey)).toBe(true);
    });

    it('should not validate an invalid API key', () => {
        expect(validateApiKey('invalid_key')).toBe(false);
    });

    it('should return user ID from a valid API key', () => {
        const userId = 'user123';
        const apiKey = generateApiKey(userId);
        expect(getUserIdFromApiKey(apiKey)).toBe(userId);
    });

    it('should return null for an invalid API key', () => {
        expect(getUserIdFromApiKey('invalid_key')).toBe(null);
    });

    it('should handle empty API key on validation', () => {
        expect(validateApiKey('')).toBe(false);
    });

    it('should handle empty API key on retrieval', () => {
        expect(getUserIdFromApiKey('')).toBe(null);
    });

    it('should handle duplicate API keys', () => {
        const userId1 = 'user123';
        const userId2 = 'user456';
        const apiKey1 = generateApiKey(userId1);
        const apiKey2 = generateApiKey(userId2);
        expect(validateApiKey(apiKey1)).toBe(true);
        expect(validateApiKey(apiKey2)).toBe(true);
    });
});