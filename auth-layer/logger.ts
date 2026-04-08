import winston from 'winston';

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

export const logRequest = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, { requestId: req.headers['x-request-id'] });
    });
    next();
};

export const logError = (error, req) => {
    logger.error(`Error: ${error.message}`, { requestId: req.headers['x-request-id'], stack: error.stack });
};

export default logger;