import winston from 'winston';
import { format } from 'logform';

const { combine, timestamp, json, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'development' ? combine(timestamp(), logFormat) : json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/all.log' })
    ],
});

// Middleware to log all requests
export const requestLogger = (req, res, next) => {
    const start = process.hrtime();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2);
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const ms = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3);
        logger.info(`Request: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${ms}ms`, { method: req.method, path: req.originalUrl, status: res.statusCode, duration: ms, requestId });
    });
    next();
};

// Error logging
export const errorLogger = (err: Error, req, res, next) => {
    logger.error('Error occurred', { message: err.message, stack: err.stack, path: req.originalUrl, requestId: req.headers['x-request-id'] });
    next(err);
};

// Initialization logging
logger.info('Starting Portfolio Tracker service', { environment: process.env.NODE_ENV, port: process.env.PORT, database: process.env.DATABASE_URL });

export default logger;
