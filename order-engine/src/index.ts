import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import { setupRequestQueue } from './requestQueue';
import { monitorMemoryUsage } from './memoryMonitor';
import { errorHandlingMiddleware } from './middleware';
import logger, { logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: ['http://allowed-origin.com'] }));
app.use(bodyParser.json());
app.use(errorHandlingMiddleware);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    await setupConnectionPooling();
    setupRequestQueue(app);
    setupGracefulShutdown();
    monitorMemoryUsage();
    app.listen(PORT, () => {
        logStartup({ PORT, ENV: process.env.NODE_ENV });
        logger.info(`Order Engine listening on port ${PORT}`);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    setupGracefulShutdown();
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully.');
    setupGracefulShutdown();
});

export default app;