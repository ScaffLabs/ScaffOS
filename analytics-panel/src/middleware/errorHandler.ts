import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from '../errors/customErrors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Service error: ' + err.message });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;