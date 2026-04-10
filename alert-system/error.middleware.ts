import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: 'Validation Error: ' + err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: 'Not Found: ' + err.message });
    }
    if (err instanceof ServiceError) {
        logger.error({ message: 'Service Error: ' + err.message });
        return res.status(500).json({ message: 'Service Error: An unexpected error occurred.' });
    }
    logger.error({ message: 'An unexpected error occurred: ' + err.message });
    return res.status(500).json({ message: 'An unexpected error occurred.' });
};

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await shutdown();
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await shutdown();
});

const shutdown = async () => {
    // Perform any necessary cleanup here
    logger.info('Cleanup completed. Exiting now.');
    process.exit(0);
};
