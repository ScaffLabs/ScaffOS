import { Request, Response, NextFunction } from 'express';
import { rateLimit } from './rateLimit';

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'API key is required' });
    }
    if (!rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded, try again later' });
    }
    next();
};