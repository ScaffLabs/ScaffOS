import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors';
import logger from './logger';
import { check, validationResult } from 'express-validator';

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

// CSRF Protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // CSRF logic here
    next();
};

// Error Handling Middleware
export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, { stack: err.stack });
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