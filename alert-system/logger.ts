import pino from 'pino';
import { Request, Response } from 'express';

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

export const logRequest = (req: Request, res: Response, start: number) => {
  const duration = Date.now() - start;
  logger.info({ method: req.method, path: req.path, status: res.statusCode, duration }, 'Request completed');
};

export const logError = (error: Error, context: any) => {
  logger.error({ error: error.stack, context }, 'An error occurred');
};

export const logStartup = (config: any) => {
  logger.info({ config }, 'Service started with configuration');
};

export const logPerformance = (operation: string, duration: number) => {
  logger.debug({ operation, duration }, 'Performance timing');
};

export const logAudit = (action: string, details: any) => {
  logger.info({ action, details }, 'Audit log entry');
};

export const logRequestId = (req: Request) => {
  const requestId = req.headers['x-request-id'] || 'N/A';
  logger.info({ requestId }, 'Processing request');
};

export default logger;