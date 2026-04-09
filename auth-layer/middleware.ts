import { Request, Response, NextFunction } from 'express';
import logger from './logger';
import { ValidationError } from './errors';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
    next();
};

export const logRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, { requestId: req.headers['x-request-id'] });
    });
    next();
};

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error occurred: ${err.message}`, { requestId: req.headers['x-request-id'], stack: err.stack });
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message, details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default { requestIdMiddleware, logRequestMiddleware, errorHandlingMiddleware };