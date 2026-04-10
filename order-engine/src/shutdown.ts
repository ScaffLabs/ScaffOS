import { closeDatabaseConnection } from './db';
import logger from './logger';
import { server } from './index';

export const setupGracefulShutdown = (app) => {
    const shutdown = async () => {
        console.log('Initiating graceful shutdown...');
        try {
            await closeDatabaseConnection();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }
        app.close(() => {
            console.log('HTTP server closed. Exiting...');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        shutdown();
    });
    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Rejection:', reason);
        shutdown();
    });
};

export const initiateShutdown = async () => {
    await shutdown();
};

export const setupMemoryMonitor = () => {
    const MEMORY_CHECK_INTERVAL = 5000;
    const MEMORY_WARN_THRESHOLD = parseFloat(process.env.MEMORY_LIMIT) * 0.01;

    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const currentMemoryUsage = memoryUsage.heapUsed / memoryUsage.heapTotal;
        console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);

        if (currentMemoryUsage > MEMORY_WARN_THRESHOLD) {
            logger.warn('Memory usage is high! Consider optimizing.');
        }
    }, MEMORY_CHECK_INTERVAL);
};

setupMemoryMonitor();