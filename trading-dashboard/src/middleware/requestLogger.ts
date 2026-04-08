import { Request, Response, NextFunction } from 'express';
import logger, { generateRequestId, logRequest } from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req.method, req.originalUrl, res.statusCode, duration, requestId);
    });
    next();
};

export default requestLogger;