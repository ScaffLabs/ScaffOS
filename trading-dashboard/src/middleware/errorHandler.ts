import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError } from '../utils/errors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
