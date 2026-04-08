import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDevelopment ? winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
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

const logRequestDuration = (req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6;
    logger.info({
      message: 'Request duration',
      duration: durationInMs,
      method: req.method,
      path: req.path,
      requestId: req.headers['x-request-id'],
    });
  });
  next();
};

export { logger, requestLogger, logError, logRequestDuration };