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

logger.sensitiveOperation = (operation: string, details: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Sensitive operation logged:', operation, details);
  } else {
    logger.info(`Sensitive operation: ${operation}`, details);
  }
};

export default logger;