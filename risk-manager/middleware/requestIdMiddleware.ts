import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';

const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    logger.debug(`Generated request ID: ${requestId}`);
    next();
};

export default requestIdMiddleware;