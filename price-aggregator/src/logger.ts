import winston from 'winston';
import { format } from 'logform';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: isDevelopment ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ) : winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'audit.log', level: 'info' }),
    ],
});

export const logRequest = (req, res, duration) => {
    logger.info({
        message: 'Request logged',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        requestId: req.headers['x-request-id'] || generateRequestId(),
    });
};

export const logError = (error, context) => {
    logger.error({
        message: 'Error occurred',
        error: error.message,
        stack: error.stack,
        context,
    });
};

export const logStartup = (config) => {
    logger.info({
        message: 'Service starting',
        config,
    });
};

export const logPerformance = (operation, metrics) => {
    logger.info({
        message: `${operation} performance metrics`,
        metrics,
    });
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export default logger;