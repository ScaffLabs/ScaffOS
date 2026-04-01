const messageCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_EXPIRATION_MS = 60000; // 1 minute

export const cacheMessage = <T>(topic: string, message: T) => {
    const key = `${topic}-${JSON.stringify(message)}`;
    const now = Date.now();
    messageCache[key] = { data: message, timestamp: now };
};

export const isMessageCached = (topic: string, message: any) => {
    const key = `${topic}-${JSON.stringify(message)}`;
    const cached = messageCache[key];
    if (cached) {
        const isExpired = (Date.now() - cached.timestamp) > CACHE_EXPIRATION_MS;
        if (isExpired) {
            delete messageCache[key];
            return false;
        }
        return true;
    }
    return false;
};