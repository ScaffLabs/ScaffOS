import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import { setupRequestQueue } from './requestQueue';
import { monitorMemoryUsage } from './memoryMonitor';
import logger, { logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    setupRequestQueue(app);
    setupGracefulShutdown(app);
    monitorMemoryUsage();
    const server = app.listen(PORT, () => {
        logStartup({ PORT, ENV: process.env.NODE_ENV });
        logger.info(`Order Engine listening on port ${PORT}`);
    });
    return server;
};

const serverInstance = startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    serverInstance.then(server => server.close(() => process.exit(1)));
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    serverInstance.then(server => server.close(() => process.exit(1)));
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Graceful shutdown initiated.');
    serverInstance.then(server => server.close(() => process.exit(0)));
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT. Graceful shutdown initiated.');
    serverInstance.then(server => server.close(() => process.exit(0)));
};

// Monitor memory usage and log warnings if usage exceeds configured limit
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
    const memoryLimit = parseFloat(process.env.MEMORY_LIMIT) * 0.01 * memoryUsage.heapTotal;
    if (memoryUsage.heapUsed > memoryLimit) {
        console.warn('Memory usage is high! Consider optimizing.');
    }
}, 5000);
