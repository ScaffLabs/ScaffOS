import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import healthCheckRouter from './routes/healthCheck';
import { config } from '../config';

const app = express();
const PORT = config.port;

app.use(cors());
app.use(helmet());
app.use(express.json());
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