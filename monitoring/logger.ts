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
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({ method, path, status: res.statusCode, duration }, 'Request logged');
    });

    next();
};

export const logError = (error, req) => {
    logger.error({ error: error.stack, message: error.message, path: req.path }, 'Error occurred');
};

export const logStartup = () => {
    logger.info({ message: 'Monitoring service starting up...', config });
};

export const logServiceHealth = (service, status) => {
    logger.info({ service, status }, 'Service health checked');
};

export const logDatabaseQuery = (query, duration) => {
    logger.debug({ query, duration }, 'Database query executed');
};

export const logRequestId = (req) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    logger.info({ requestId }, 'Request ID logged');
};

export default logger;