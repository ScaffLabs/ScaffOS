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
import axios from 'axios';

const app = express();
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
const circuitBreaker = new CircuitBreaker();
const axiosInstance = axios.create({ timeout: 5000 });

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

const retryPromise = async (promiseFn, retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await promiseFn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000)); // Exponential backoff
        }
    }
};

const checkExternalService = async () => {
    await retryPromise(() => axiosInstance.get(env.PORTFOLIO_SERVICE_URL));
};

setInterval(checkExternalService, 300000); // Check every 5 minutes
