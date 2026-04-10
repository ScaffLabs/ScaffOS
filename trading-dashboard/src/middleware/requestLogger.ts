import { Request, Response, NextFunction } from 'express';
import logger, { generateRequestId } from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req.method, req.originalUrl, res.statusCode, duration, requestId);
    });

    req.headers['x-request-id'] = requestId; // Attach request ID to the request
    next();
};

export default requestLogger;
