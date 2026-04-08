import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    isProduction ? winston.format.json() : winston.format.prettyPrint(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      const msg = `${timestamp} [${level}]: ${message}`;
      return metadata && Object.keys(metadata).length ? `${msg} ${JSON.stringify(metadata)}` : msg;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export const logRequest = (req, res, start) => {
  const duration = Date.now() - start;
  const requestId = req.headers['x-request-id'] || 'N/A';
  logger.info({ method: req.method, path: req.path, status: res.statusCode, duration, requestId }, 'Request completed');
};

export const logError = (error, context) => {
  logger.error({ error: error.stack, context }, 'An error occurred');
};

export const logStartup = (config) => {
  logger.info({ config }, 'Service started with configuration');
};

export const logPerformance = (operation, duration) => {
  logger.debug({ operation, duration }, 'Performance timing');
};

export default logger;