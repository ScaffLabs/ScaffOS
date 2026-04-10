import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2);
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const ms = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3);
        logger.info(`Request: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${ms}ms`, { method: req.method, path: req.originalUrl, status: res.statusCode, duration: ms, requestId });
    });
    next();
};

export default requestLogger;