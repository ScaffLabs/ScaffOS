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

const app = express();
const PORT = config.port;
const dbStore = new SQLiteStore('./database.sqlite');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(requestLogger);
app.use('/api/backtest', backtestRouter);
app.use('/health', healthCheckRouter);
app.use(errorHandler);

(async () => {
    await migrateDatabase(dbStore);
    app.listen(PORT, () => {
        logger.info(`Backtester service running on port ${PORT}`);
    });
})();