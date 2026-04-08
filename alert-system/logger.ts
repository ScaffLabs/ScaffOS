import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: { colorize: true }
  },
  level: 'info',
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    }
  }
});

export const logRequest = (req, res, start) => {
  const duration = Date.now() - start;
  logger.info({ method: req.method, path: req.path, status: res.statusCode, duration }, 'Request completed');
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