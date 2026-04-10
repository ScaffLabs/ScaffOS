import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/validationError';
import { ServiceError } from '../errors/serviceError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';

/**
 * Global error handler middleware.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    logger.error({ message: err.message, stack: err.stack, reqId }); // Log error details for debugging

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
    return res.status(500).json({ message: 'Internal Server Error', error: 'An unexpected error occurred' });
};