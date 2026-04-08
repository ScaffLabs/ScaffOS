import { Request, Response, NextFunction } from 'express';
import { logError } from '../logger';
import { ServiceError, ValidationError, NotFoundError } from '../errors/customErrors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).id;
    if (err instanceof ValidationError) {
        logError(err, 'Validation error');
        return res.status(400).json({ error: err.message, requestId });
    }
    if (err instanceof NotFoundError) {
        logError(err, 'Not found error');
        return res.status(404).json({ error: err.message, requestId });
    }
    if (err instanceof ServiceError) {
        logError(err, 'Service error');
        return res.status(500).json({ error: 'Service error: ' + err.message, requestId });
    }
    logError(err, 'Unhandled error');
    return res.status(500).json({ error: 'Internal Server Error', requestId });
};

export default errorHandler;