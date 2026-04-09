import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (err instanceof ValidationError) {
        statusCode = 400;
        errorMessage = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        errorMessage = err.message;
    } else if (err instanceof ServiceError) {
        statusCode = 503;
        errorMessage = err.message;
    }

    logger.error({ message: errorMessage, error: err instanceof Error ? err.message : 'Unknown error', requestId: req.headers['x-request-id'], sensitiveData: undefined });
    res.status(statusCode).json({ error: errorMessage });
};

export { ServiceError, ValidationError, NotFoundError, errorHandler };