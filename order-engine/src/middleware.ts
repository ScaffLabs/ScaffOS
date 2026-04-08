import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
    next();
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, { requestId: req.headers['x-request-id'], stack: err.stack });
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