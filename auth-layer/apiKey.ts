import crypto from 'crypto';
import { UserId } from './types';

const apiKeys: Map<string, UserId> = new Map(); // Store encrypted API keys

export const generateApiKey = (userId: UserId): string => {
    const apiKey = crypto.randomBytes(16).toString('hex'); // Generate a random API key
    const encryptedKey = crypto.createHmac('sha256', process.env.API_KEY_SECRET).update(apiKey).digest('hex'); // Encrypt the API key
    apiKeys.set(encryptedKey, userId);
    return apiKey;
};

export const validateApiKey = (apiKey: string): boolean => {
    const encryptedKey = crypto.createHmac('sha256', process.env.API_KEY_SECRET).update(apiKey).digest('hex');
    return apiKeys.has(encryptedKey);
};

export const getUserIdFromApiKey = (apiKey: string): UserId | null => {
    const encryptedKey = crypto.createHmac('sha256', process.env.API_KEY_SECRET).update(apiKey).digest('hex');
    return apiKeys.get(encryptedKey) || null;
};