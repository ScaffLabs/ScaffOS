import { Request, Response, NextFunction } from 'express';
import { logError } from '../logger';
import { ServiceError, ValidationError, NotFoundError } from '../errors/customErrors';
import { ErrorResponse, ErrorType } from '../types';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).id;
    let errorResponse: ErrorResponse;

    if (err instanceof ValidationError) {
        logError(err, 'Validation error');
        errorResponse = { type: ErrorType.VALIDATION_ERROR, message: err.message };
        return res.status(400).json({ ...errorResponse, requestId });
    }
    if (err instanceof NotFoundError) {
        logError(err, 'Not found error');
        errorResponse = { type: ErrorType.NOT_FOUND, message: err.message };
        return res.status(404).json({ ...errorResponse, requestId });
    }
    if (err instanceof ServiceError) {
        logError(err, 'Service error');
        errorResponse = { type: ErrorType.SERVICE_ERROR, message: 'Service error: ' + err.message };
        return res.status(500).json({ ...errorResponse, requestId });
    }
    logError(err, 'Unhandled error');
    errorResponse = { type: ErrorType.SERVICE_ERROR, message: 'Internal Server Error' };
    return res.status(500).json({ ...errorResponse, requestId });
};

export default errorHandler;