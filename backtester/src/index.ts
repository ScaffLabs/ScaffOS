import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import { logger, requestLogger } from './utils/logger';
import healthCheckRouter from './routes/healthCheck';
import { config } from '../config';
import { monitorMemoryUsage } from './utils/monitor';
import { gracefulShutdown } from './utils/gracefulShutdown';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';

const app = express();
const PORT = config.port;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors({
    origin: ['http://example.com', 'http://anotherdomain.com'],
}));
app.use(helmet());
app.use(limiter);
app.use(bodyParser.json({ limit: '1mb' })); // Limit request size
app.use(requestLogger);

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info(`Backtester service running on port ${PORT}`);
    monitorMemoryUsage();
});

const shutdown = async () => {
    await gracefulShutdown(server);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err);
    shutdown();
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: ', reason);
    shutdown();
});
