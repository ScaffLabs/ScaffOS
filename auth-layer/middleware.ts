import { Request, Response, NextFunction } from 'express';
import logger from './logger';
import { ValidationError } from './errors';

const MAX_REQUEST_SIZE = '1mb'; // Set max request size limit

export const requestSizeLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > parseInt(MAX_REQUEST_SIZE)) {
        return res.status(413).json({ error: 'Payload too large' });
    }
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

export default { requestSizeLimitMiddleware, logRequestMiddleware, errorHandlingMiddleware };