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

/**
 * Error handler middleware that formats errors and sends responses.
 * @param {unknown} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
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

    logger.error({ message: errorMessage, error: err instanceof Error ? err.message : 'Unknown error', requestId: req.headers['x-request-id'] });
    res.status(statusCode).json({ error: errorMessage });
};

/**
 * Validates the request body and throws ValidationError if invalid.
 * @param {any} body - The request body to validate.
 */
const validateRequestBody = (body: any) => {
    if (!body || typeof body !== 'object') {
        throw new ValidationError('Request body must be a valid object.');
    }
};

export { ServiceError, ValidationError, NotFoundError, errorHandler, validateRequestBody };