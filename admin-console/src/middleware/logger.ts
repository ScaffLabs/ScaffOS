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
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${requestId}`);
    });
    next();
};

export const logError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message} - ${err.stack}`);
    res.status(500).json({ error: 'Internal Server Error' });
};

export const logSuccess = (message: string) => {
    logger.info(message);
};

export const logAudit = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    res.on('finish', () => {
        const { method, originalUrl } = req;
        logger.info(`Audit Log: ${method} ${originalUrl} - Request ID: ${requestId}`);
    });
    next();
};

export const logPerformance = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Performance Log: ${req.method} ${req.originalUrl} took ${duration}ms`);
    });
    next();
};