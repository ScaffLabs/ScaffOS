const apiKeys = new Map<string, boolean>(); // Replace with a secure storage solution

export const generateApiKey = (userId: string): string => {
    const apiKey = 'key-' + userId + '-' + Date.now();
    apiKeys.set(apiKey, true); // Store securely
    return apiKey;
};

export const validateApiKey = (apiKey: string): boolean => {
    return apiKeys.has(apiKey);
};