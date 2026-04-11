import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const logMessage = `${timestamp} ${level}: ${message}`;
  return meta && Object.keys(meta).length ? `${logMessage} ${JSON.stringify(meta)}` : logMessage;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    process.env.NODE_ENV === 'development' ? winston.format.colorize() : winston.format.json(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 'N/A';
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      requestId,
      user: req.user ? req.user.id : null,
      path: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      duration: duration,
    });
  });
  next();
};

const logStartupConfig = () => {
  logger.info('Starting application with configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    EVENT_BUS_URL: process.env.EVENT_BUS_URL,
    ANOTHER_SERVICE_URL: process.env.ANOTHER_SERVICE_URL,
  });
};

const logError = (error: Error, context: any) => {
  logger.error('An error occurred', { error: error.message, stack: error.stack, context });
};

export { logger, requestLogger, logStartupConfig, logError };