import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
    level: isProduction ? 'info' : 'debug',
    transport: isProduction ? undefined : { 
        target: 'pino-pretty',
        options: { colorize: true }
    },
    prettyPrint: !isProduction,
});

export const logRequest = (method: string, path: string, status: number, duration: number) => {
    logger.info({ method, path, status, duration }, 'Request completed');
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