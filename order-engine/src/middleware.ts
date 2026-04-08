import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors';

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
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