import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};

export default requestIdMiddleware;
