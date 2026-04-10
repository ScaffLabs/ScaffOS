import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        process.env.NODE_ENV === 'development' ? winston.format.prettyPrint() : winston.format.json(),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            message: 'Request completed',
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration: duration,
            requestId: requestId
        });
    });
    next();
};

export const logError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
        message: 'Error occurred',
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        requestId: req.headers['x-request-id'] || Math.random().toString(36).substring(7),
    });
    res.status(500).json({ error: 'Internal Server Error' });
};