import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ message: err.message, type: 'ServiceError' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error', type: 'UnknownError' });
};

export default errorHandler; 
