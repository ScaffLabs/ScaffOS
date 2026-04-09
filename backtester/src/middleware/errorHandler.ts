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

const validateContentType = (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/json') {
        return res.status(415).send('Content type must be application/json');
    }
    next();
};

const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength, 10) > 1048576) { // 1MB limit
        return res.status(413).send('Request size exceeds limit');
    }
    next();
};

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

export { ServiceError, ValidationError, NotFoundError, errorHandler, validateContentType, requestSizeLimit };