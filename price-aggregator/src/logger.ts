import winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
    level: 'info',
    format: isDevelopment ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ) : winston.format.json(),
    transports: [
        new winston.transports.Console(),
    ],
});

export const logRequest = (req, res, duration) => {
    logger.info({
        message: 'Request logged',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        requestId: req.headers['x-request-id'],
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

export default logger;