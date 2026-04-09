import winston from 'winston';

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
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.add(new winston.transports.File({
  filename: 'error.log',
  level: 'error',
}));

const requestLogger = (req, res, next) => {
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

export { logger, requestLogger };