import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        isProduction ? winston.format.json() : winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export const logRequest = (method: string, path: string, status: number, duration: number, reqId: string) => {
    logger.info({ method, path, status, duration, reqId });
};

export const logError = (error: Error, reqId: string) => {
    logger.error({ message: error.message, stack: error.stack, reqId });
};

export const logStartup = (config: object) => {
    logger.info('Service started with configuration:', config);
};

export const logPerformance = (operation: string, duration: number, reqId: string) => {
    logger.info({ operation, duration, reqId });
};

export default logger;
