import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { validateApiKey } from './apiKey';
import { rateLimit } from './rateLimit';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || !validateApiKey(apiKey)) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};