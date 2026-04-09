import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || 'N/A';

    // Handle validation errors distinctly to provide clear feedback to the client.
    if (err instanceof ValidationError) {
        logger.warn('Validation error occurred', { message: err.message, requestId });
        return res.status(400).json({ message: err.message }); // Bad request
    }

    // If the error is a not found error, log it with an info level as it's expected behavior in some cases.
    if (err instanceof NotFoundError) {
        logger.info('Not found error', { message: err.message, requestId });
        return res.status(404).json({ message: err.message }); // Not found
    }

    // For service errors, log them as errors to track unexpected issues in the application.
    if (err instanceof ServiceError) {
        logger.error('Service error occurred', { message: err.message, requestId });
        return res.status(500).json({ message: 'Internal Server Error', type: 'ServiceError' }); // Internal server error
    }

    // Log any unknown errors as critical since they indicate an unhandled situation.
    logger.error('Unknown error occurred', { error: err.message, requestId });
    return res.status(500).json({ message: 'Internal Server Error', type: 'UnknownError' }); // Fallback for unhandled errors
};

export default errorHandler;