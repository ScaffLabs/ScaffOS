import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple()
        }),
    ],
});

export const logRequest = (method: string, path: string, status: number, duration: number, reqId: string) => {
    logger.info({ method, path, status, duration, reqId });
};

export const logError = (error: Error, reqId: string) => {
    logger.error({ message: error.message, stack: error.stack, reqId });
};

export default logger;
