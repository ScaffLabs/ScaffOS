import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        process.env.NODE_ENV === 'development' ? winston.format.prettyPrint() : winston.format.json(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `[{timestamp}] {level}: {message}`)
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`{req.method} {req.originalUrl} {res.statusCode} {duration}ms {requestId}`);
    });
    next();
};

export const logError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: {err.message} - {err.stack}`);
    res.status(500).json({ error: 'Internal Server Error' });
};