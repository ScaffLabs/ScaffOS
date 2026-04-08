import express from 'express';
import { requestLogger, errorLogger } from './middleware/loggingMiddleware';
import { initializeRedis } from './config/redis.config';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(requestLogger);
app.use(express.json({ limit: '1mb' })); // Limit request size to 1 MB

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
    app.use('/events', eventRoutes());
    app.use(errorLogger);
    app.use(errorHandler); // Centralized error handling middleware
    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });
};

main();