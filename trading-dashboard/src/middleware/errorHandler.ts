import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    }
    if (err instanceof ServiceError) {
        logger.error('Service error occurred', { message: err.message }); // Avoid logging sensitive data
        return res.status(500).json({ message: 'Internal Server Error', type: 'ServiceError' });
    }
    logger.error('Unknown error occurred', { error: err.message }); // Avoid logging sensitive data
    return res.status(500).json({ message: 'Internal Server Error', type: 'UnknownError' });
};

export default errorHandler;