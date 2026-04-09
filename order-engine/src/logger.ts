import winston from 'winston';
import { Request, Response } from 'express';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

export const logRequest = (req: Request, res: Response, next: Function) => {
    const start = process.hrtime();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInMs = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(2);
        logger.info(`Request: ${req.method} ${req.path} - ${res.statusCode} - ${durationInMs}ms`, { requestId });
    });
    next();
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export const logError = (error: Error, req: Request) => {
    logger.error(error.message, { stack: error.stack, url: req.url });
};

export const logStartup = (config: any) => {
    logger.info('Starting Order Engine', { config });
};

export default logger;