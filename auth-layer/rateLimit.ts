import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';

const apiLimits: { [key: string]: number } = {};
const MAX_REQUESTS = 100;
const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'API key is required' });
    }

    const currentTime = Date.now();
    if (!apiLimits[apiKey]) {
        apiLimits[apiKey] = 1;
        setTimeout(() => { delete apiLimits[apiKey]; }, TIME_WINDOW);
    } else {
        apiLimits[apiKey]++;
    }

    if (apiLimits[apiKey] > MAX_REQUESTS) {
        return res.status(429).json({ error: 'Rate limit exceeded, try again later' });
    }
    next();
};