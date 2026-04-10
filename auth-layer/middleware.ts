import { Request, Response, NextFunction } from 'express';
import logger from './logger';
import { ValidationError } from './errors';
import { sanitizeUserInput } from './userValidation';

const requestSizeLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const MAX_REQUEST_SIZE = 1 * 1024 * 1024; // 1 MB
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > MAX_REQUEST_SIZE) {
        return res.status(413).json({ error: 'Payload too large' });
    }
    next();
};

const logRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, { requestId: req.headers['x-request-id'] });
    });
    next();
};

const validateAndSanitizeUserInput = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = sanitizeUserInput(req.body);
        next();
    } catch (error) {
        logger.error('Validation error', { error: error.message });
        return res.status(400).json({ error: 'Invalid input' });
    }
};

export { requestSizeLimitMiddleware, logRequestMiddleware, validateAndSanitizeUserInput };