import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from './errors';
import logger from './logger';

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    logger.error(err.message, { requestId, stack: err.stack });
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

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
    next();
};
