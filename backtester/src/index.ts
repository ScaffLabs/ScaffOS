import express from 'express';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { config } from '../config';

const app = express();
const PORT = config.port;

app.use(express.json());

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
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Backtester service running on port ${PORT}`);
  logger.info('Configuration: ', config);
});

const shutdown = () => {
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);