import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import healthCheckRouter from './routes/healthCheck';

const app = express();
const PORT = config.port;

// CORS configuration
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));

// Helmet for security headers
app.use(helmet());

// Limit request size
app.use(express.json({ limit: '1mb' }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      requestId: req.headers['x-request-id'] || 'N/A',
    });
  });
  next();
});

app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Backtester service running on port ${PORT}`);
});

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await new Promise(resolve => server.close(resolve));
  logger.info('Server closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  shutdown();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});
