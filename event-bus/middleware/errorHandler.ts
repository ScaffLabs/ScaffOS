import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/validationError';
import { ServiceError } from '../errors/serviceError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    if (err instanceof ValidationError) {
        logger.warn({ message: err.message, reqId });
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        logger.warn({ message: err.message, reqId });
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        logger.error(err, reqId);
        return res.status(500).json({ message: err.message });
    }
    logger.error(err, reqId);
    return res.status(500).json({ message: 'Internal Server Error' });
};
