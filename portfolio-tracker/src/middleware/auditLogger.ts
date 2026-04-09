import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';

const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2);
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, { method: req.method, path: req.originalUrl, status: res.statusCode, duration, requestId });
    });
    next();
};

export default auditLogger;