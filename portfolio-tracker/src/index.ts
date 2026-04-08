import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import logger, { requestLogger, errorLogger } from './services/logger';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import { healthCheck, readinessCheck } from './services/healthService';
import { Pool } from 'pg';
import env from './config';
import { CircuitBreaker } from 'circuit-breaker-js';

const app = express();
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
const circuitBreaker = new CircuitBreaker();

app.use(json({ limit: '1mb' }));
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(requestLogger);
app.use(errorLogger);
connectToEventBus();

app.use('/api/portfolios', portfolioRoutes);
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    logger.info(`Portfolio Tracker service running on port ${PORT}`);
});

const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await new Promise((resolve) => server.close(resolve));
    await dbPool.end();
    logger.info('Closed HTTP server and database connections.');
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

setInterval(async () => {
    const memoryUsage = process.memoryUsage();
    logger.info('Memory Usage', memoryUsage);
}, 60000);