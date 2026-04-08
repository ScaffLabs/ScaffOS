import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
};

export default requestLogger;