import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: 'Validation Error: ' + err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: 'Not Found: ' + err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ message: 'Service Error: ' + err.message });
    }
    return res.status(500).json({ message: 'An unexpected error occurred.' });
};