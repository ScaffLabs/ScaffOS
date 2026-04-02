const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT = 100; // requests per hour
const TIME_WINDOW = 3600000; // 1 hour in milliseconds

export const rateLimit = (apiKey: string) => {
    const now = Date.now();
    const record = rateLimitMap.get(apiKey) || { count: 0, lastRequest: now };

    if (now - record.lastRequest > TIME_WINDOW) {
        record.count = 0; // Reset count if time window has passed
        record.lastRequest = now;
    }

    if (record.count >= RATE_LIMIT) {
        return false; // Rate limit exceeded
    }

    record.count++;
    rateLimitMap.set(apiKey, record);
    return true;
};