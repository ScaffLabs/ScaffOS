import winston from 'winston';

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

export const logRequest = (req, res, next) => {
    const start = process.hrtime();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInMs = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(2);
        logger.info(`Request: ${req.method} ${req.path} - ${res.statusCode} - ${durationInMs}ms`, { requestId });
    });
    next();
};

export const logError = (error, req) => {
    logger.error('Error occurred', { error: error.stack, requestId: req.headers['x-request-id'] });
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export default logger;

export const logDatabaseQuery = (query, params, duration, requestId) => {
    logger.info('Database Query Executed', { query, params, durationInMs: duration, requestId });
};

export const logServiceCall = (serviceName, action, duration, success, requestId) => {
    logger.info('Service Call', { serviceName, action, durationInMs: duration, success, requestId });
};

export const logStartup = (config) => {
    logger.info('Service started', { config });
};

export const logShutdown = () => {
    logger.info('Service shutting down');
};
