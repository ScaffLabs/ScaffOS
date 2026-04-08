import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from './jwt';
import { validateApiKey, getUserIdFromApiKey } from './apiKey';
import { rateLimit } from './rateLimit';
import { findUserById } from './user';
import logger, { logError } from './logger';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;
    logger.info(`New request started`, { requestId });
    next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || !validateApiKey(apiKey)) {
        logger.error(`Unauthorized access attempt`, { requestId: req.headers['x-request-id'] });
        return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!rateLimit(apiKey)) {
        logger.warn(`Rate limit exceeded`, { requestId: req.headers['x-request-id'] });
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (!token) {
        logger.error(`Token required`, { requestId: req.headers['x-request-id'] });
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const { userId } = verifyToken(token);
        const user = findUserById(userId);
        if (!user) {
            logger.error(`User not found`, { requestId: req.headers['x-request-id'] });
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        logError(error, req);
        return res.status(401).json({ error: error.message });
    }
};