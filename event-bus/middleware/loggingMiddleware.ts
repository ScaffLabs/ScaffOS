import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const reqId = req.headers['x-request-id'] || 'unknown';
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req.method, req.originalUrl, res.statusCode, duration, reqId);
    });
    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    logger.logError(err, reqId);
    next(err);
};

export default { requestLogger, errorLogger };