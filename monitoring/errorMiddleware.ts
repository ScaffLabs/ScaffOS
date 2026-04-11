import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    logger.error({ error: err.stack, message: err.message, path: req.path, requestId }, 'Error occurred');

    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message, requestId });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message, requestId });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: err.message, requestId });
    }
    return res.status(500).json({ error: 'Something went wrong! Please try again later.', requestId });
};

export default errorMiddleware; 
