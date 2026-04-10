import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError, AppError } from './errors';
import logger from './logger';

// Input Validation Middleware
export const validateInput = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw new ValidationError('Validation failed: ' + validationErrors.array().map(e => e.msg).join(', '));
        }
        next();
    };
};

// Error Handling Middleware
export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.logError(err, req);
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
};

// Graceful Shutdown Middleware
export const setupGracefulShutdown = (app: any) => {
    const shutdown = async () => {
        console.log('Initiating graceful shutdown...');
        try {
            await closeDatabaseConnection();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }
        app.close(() => {
            console.log('HTTP server closed. Exiting...');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        shutdown();
    });
    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Rejection:', reason);
        shutdown();
    });
};