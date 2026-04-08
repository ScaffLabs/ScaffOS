import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? winston.format.json() : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export const logRequest = (method: string, path: string, status: number, duration: number, requestId: string) => {
    logger.info({ method, path, status, duration, requestId }, 'Request completed');
};

export const logError = (error: Error, context: string) => {
    logger.error({ message: error.message, stack: error.stack, context }, 'Error occurred');
};

export const logStartup = (config: Record<string, any>) => {
    logger.info({ config }, 'Server started with configuration');
};

export const logPerformance = (queryName: string, duration: number) => {
    logger.debug({ queryName, duration }, 'Performance timing for query');
};

export default logger;