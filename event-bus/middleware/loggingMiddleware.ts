import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const reqId = req.headers['x-request-id'] || 'unknown';
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, duration, reqId });
    });
    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    logger.error({ message: err.message, stack: err.stack, reqId });
    next(err);
};

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        logger.info({ message: 'Sensitive operation', reqId, method: req.method, path: req.originalUrl, body: req.body });
    }
    next();
};

export default { requestLogger, errorLogger, auditLogger };