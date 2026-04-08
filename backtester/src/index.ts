import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import healthCheckRouter from './routes/healthCheck';
import { config } from '../config';
import { monitorMemoryUsage } from './utils/monitor';

const app = express();
const PORT = config.port;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '1mb' }));

app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info(`Backtester service running on port ${PORT}`);
    monitorMemoryUsage();
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await new Promise(resolve => server.close(resolve));
    logger.info('Server closed');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
