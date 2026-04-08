import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || 'N/A';
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        logger.error('Service error occurred', { message: err.message, requestId });
        return res.status(500).json({ message: 'Internal Server Error', type: 'ServiceError' });
    }
    logger.error('Unknown error occurred', { error: err.message, requestId });
    return res.status(500).json({ message: 'Internal Server Error', type: 'UnknownError' });
};

export default errorHandler; 