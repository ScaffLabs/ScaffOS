import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const MAX_REQUESTS = 100;
const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

const limiter = rateLimit({
    windowMs: TIME_WINDOW,
    max: MAX_REQUESTS,
    message: { error: 'Too many requests, please try again later.' },
});

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'API key is required' });
    }
    limiter(req, res, next);
};