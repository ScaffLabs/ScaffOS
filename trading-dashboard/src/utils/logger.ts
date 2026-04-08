import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
        isProduction ? winston.format.json() : winston.format.prettyPrint(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'audit.log', level: 'info' })
    ],
});

export const logRequest = (method: string, path: string, status: number, duration: number, requestId: string) => {
    logger.info(`Request ${method} ${path} ${status} - ${duration}ms`, { requestId });
};

export const logError = (error: Error, requestId: string) => {
    logger.error(error.message, { stack: error.stack, requestId });
};

export const logStartup = (config: any) => {
    logger.info('Startup configuration:', config);
};

export const logServiceConnection = (service: string, status: string) => {
    logger.info(`Service ${service} is ${status}`);
};

export default logger;