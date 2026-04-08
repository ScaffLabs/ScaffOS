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
    if (err instanceof ServiceError) {
        logger.error({ message: 'Service error occurred', error: err.message, requestId: req.headers['x-request-id'] });
    } else if (err instanceof ValidationError) {
        logger.warn({ message: 'Validation error occurred', error: err.message, requestId: req.headers['x-request-id'] });
    } else {
        logger.error({ message: 'Internal server error', error: err instanceof Error ? err.message : 'Unknown error', requestId: req.headers['x-request-id'] });
    }

    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(503).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export { ServiceError, ValidationError, NotFoundError, errorHandler };