import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors';
import logger from './logger';

// Input Validation Middleware
export const validateInput = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
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
    if (err instanceof ServiceError) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
};

// Request ID Middleware
const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
    next();
};

// Graceful shutdown handling
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
        console.error('Uncaught Exception:', err);
        shutdown();
    });
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
        shutdown();
    });
};