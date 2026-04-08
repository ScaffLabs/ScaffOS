import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { validateApiKey, getUserIdFromApiKey } from './apiKey';
import { rateLimit } from './rateLimit';
import { findUserById } from './user';

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
        const { userId } = verifyToken(token);
        const user = findUserById(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};
