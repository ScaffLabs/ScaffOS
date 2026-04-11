import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors/CustomErrors';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
        message: 'An error occurred',
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });

    if (err instanceof ValidationError) {
        return res.status(400).json({ error: 'Validation Error: ' + err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: 'Not Found: ' + err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Service Error: ' + err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

// Graceful shutdown handler
const gracefulShutdown = (server: any, db: any) => {
    const shutdown = async () => {
        logger.info('Shutting down gracefully...');
        await db.closeConnection();
        server.close(() => {
            logger.info('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

export { errorHandler, gracefulShutdown };