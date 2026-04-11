import { Request, Response, NextFunction } from 'express';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import logger from './logger';

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error occurred: ${err.message}`, { requestId: req.headers['x-request-id'], stack: err.stack });
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message, details: err.errors });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Service Error: ' + err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default errorMiddleware;