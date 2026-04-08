import crypto from 'crypto';

const apiKeys = new Map<string, string>(); // Store encrypted API keys

export const generateApiKey = (userId: string): string => {
    const apiKey = crypto.randomBytes(16).toString('hex'); // Generate a random API key
    const encryptedKey = crypto.createHmac('sha256', 'secret').update(apiKey).digest('hex'); // Encrypt the API key
    apiKeys.set(encryptedKey, userId);
    return apiKey;
};

export const validateApiKey = (apiKey: string): boolean => {
    const encryptedKey = crypto.createHmac('sha256', 'secret').update(apiKey).digest('hex');
    return apiKeys.has(encryptedKey);
};

export const getUserIdFromApiKey = (apiKey: string): string | null => {
    const encryptedKey = crypto.createHmac('sha256', 'secret').update(apiKey).digest('hex');
    return apiKeys.get(encryptedKey) || null;
};
