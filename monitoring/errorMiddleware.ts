import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from './errorClasses';

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.status(500).json({ error: 'Something went wrong!' });
};

export default errorMiddleware;
