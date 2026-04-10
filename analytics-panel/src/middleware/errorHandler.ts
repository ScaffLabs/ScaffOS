import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { ServiceError, ValidationError, NotFoundError } from '../errors/customErrors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).id;
    let errorResponse;

    // Handle validation errors specifically for better clarity
    if (err instanceof ValidationError) {
        logger.error(err, 'Validation error');
        errorResponse = { type: 'VALIDATION_ERROR', message: err.message };
        return res.status(400).json({ ...errorResponse, requestId });
    }
    // Handle not found errors clearly
    if (err instanceof NotFoundError) {
        logger.error(err, 'Not found error');
        errorResponse = { type: 'NOT_FOUND', message: err.message };
        return res.status(404).json({ ...errorResponse, requestId });
    }
    // Handle service errors
    if (err instanceof ServiceError) {
        logger.error(err, 'Service error');
        errorResponse = { type: 'SERVICE_ERROR', message: 'Service error: ' + err.message };
        return res.status(500).json({ ...errorResponse, requestId });
    }
    // For any other unhandled error, log it and return a generic message
    logger.error(err, 'Unhandled error');
    errorResponse = { type: 'SERVICE_ERROR', message: 'Internal Server Error', details: 'An unexpected error occurred. Please try again later.' };
    return res.status(500).json({ ...errorResponse, requestId });
};

export default errorHandler;