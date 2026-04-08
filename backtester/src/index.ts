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
import expressSanitizer from 'express-sanitizer';
import csurf from 'csurf';

const app = express();
const PORT = config.port;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors({
    origin: ['http://example.com', 'http://anotherdomain.com'], // Allowed origins
}));
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(expressSanitizer()); // Input sanitization middleware
app.use(csurf({ cookie: true })); // CSRF protection

app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

app.use((req, res, next) => {
    logger.info(`Request: ${req.method} ${req.url}`);
    next();
});

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
