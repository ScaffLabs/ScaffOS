import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDevelopment ? winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ) : winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;
  req.startTime = Date.now();
  logger.info({
    message: 'Incoming request',
    method: req.method,
    path: req.path,
    requestId,
  });

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info({
      message: 'Response sent',
      status: res.statusCode,
      duration,
      requestId,
    });
  });

  next();
};

const logError = (err, req) => {
  logger.error({
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : 'No stack trace',
    requestId: req.headers['x-request-id'] || 'N/A',
  });
};

const logStartup = (config) => {
  logger.info({
    message: 'Service starting...',
    config,
  });
};

const logDatabasePerformance = (operation, duration, requestId) => {
  logger.info({
    message: `Database operation: ${operation} completed`,
    duration,
    requestId,
  });
};

const logRequestDetails = (req) => {
  logger.info({
    message: 'Request details',
    requestId: req.headers['x-request-id'] || 'N/A',
    body: req.body,
    params: req.params,
  });
};

export { logger, requestLogger, logError, logStartup, logDatabasePerformance, logRequestDetails };