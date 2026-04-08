import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      requestId: req.headers['x-request-id'],
      user: req.user ? req.user.id : null,
      path: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      duration: duration,
    });
  });

  next();
};

export default loggingMiddleware; 
