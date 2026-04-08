import express from 'express';
import { requestLogger, errorLogger } from './middleware/loggingMiddleware';
import { initializeRedis } from './config/redis.config';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { config } from './config';

const app = express();

app.use(requestLogger);
app.use(express.json({ limit: '1mb' })); // Limit request size to 1 MB

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
    app.use('/events', eventRoutes());
    app.use(errorLogger); // Add error logging middleware
    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });
};

main();