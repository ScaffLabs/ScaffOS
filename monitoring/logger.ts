import winston from 'winston';
import config from './config';

const logFormat = config.NODE_ENV === 'production' ? 'json' : 'pretty';

const logger = winston.createLogger({
    level: 'info',
    format: logFormat === 'json' ? winston.format.json() : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

export const logRequest = (req, res, next) => {
    const { method, path } = req;
    const requestId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({ method, path, status: res.statusCode, duration, requestId }, 'Request completed');
    });

    next();
};

export const logError = (error, req) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    logger.error({ error: error.stack, message: error.message, path: req.path, requestId }, 'Error occurred');
};

export const logStartup = () => {
    logger.info({ message: 'Monitoring service starting up...', config });
};

export default logger;