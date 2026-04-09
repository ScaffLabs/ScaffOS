import { Request, Response, NextFunction } from 'express';
import { ValidationError, ServiceError, NotFoundError } from '../errors/CustomErrors';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
        message: 'Error occurred',
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Service Error: ' + err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;