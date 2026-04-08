import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : winston.format.json(),
    }),
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
    logger.info({
      message: 'Response sent',
      status: res.statusCode,
      duration: Date.now() - req.startTime,
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

export { logger, requestLogger, logError };