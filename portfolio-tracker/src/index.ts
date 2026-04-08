import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import logger, { requestLogger } from './services/logger';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import { healthCheck } from './services/healthService';
import { createClient } from 'redis';
import { Pool } from 'pg';

const app = express();
const redisClient = createClient();
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(json({ limit: '1mb' }));
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(requestLogger);
connectToEventBus();
app.use('/api/portfolios', portfolioRoutes);
app.get('/health', healthCheck);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    logger.info(`Portfolio Tracker service running on port ${PORT}`);
});

const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
        logger.info('Closed HTTP server.');
        redisClient.quit();
        dbPool.end();
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('Uncaught Exception');
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    shutdown('Unhandled Rejection');
});

setInterval(async () => {
    const memoryUsage = process.memoryUsage();
    logger.info('Memory Usage', memoryUsage);
}, 60000);
