import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/validationError';
import { ServiceError } from '../errors/serviceError';
import { NotFoundError } from '../errors/notFoundError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
};