import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const logFormat = winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    return `${timestamp} [${level}]${requestId ? ' [Request ID: ' + requestId + ']' : ''}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        process.env.NODE_ENV === 'production' ? winston.format.json() : logFormat
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const requestId = req.headers['x-request-id'];
        if (res.statusCode >= 400) {
            logger.error(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, { requestId });
        } else {
            logger.info(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, { requestId });
        }
    });
    next();
};

export default logger;
