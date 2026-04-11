import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';
import { logger, requestLogger } from './utils/logger';
import healthCheckRouter from './routes/healthCheck';
import { config } from '../config';
import { migrateDatabase } from './storage/migrations';
import { SQLiteStore } from './storage/SQLiteStore';
import { monitorMemoryUsage } from './utils/monitor';
import { gracefulShutdown } from './utils/gracefulShutdown';

const app = express();
const PORT = config.port;
const dbStore = new SQLiteStore('./database.sqlite');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors({
    origin: ['https://your-allowed-origin.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '1mb' })); // Limit request size to 1mb
app.use(requestLogger);
app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

// Middleware to validate content types
app.use((req, res, next) => {
    const contentType = req.headers['content-type'];
    if (req.method === 'POST' && !contentType.includes('application/json')) {
        return res.status(415).json({ error: 'Content type must be application/json' });
    }
    next();
});

(async () => {
    await migrateDatabase(dbStore);
    app.listen(PORT, () => {
        logger.info(`Backtester service running on port ${PORT}`);
    });
})();

process.on('SIGTERM', () => gracefulShutdown(app));
process.on('SIGINT', () => gracefulShutdown(app));

monitorMemoryUsage();