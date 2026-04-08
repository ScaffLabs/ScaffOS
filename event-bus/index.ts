import { initializeRedis } from './config/redis.config';
import { RedisEventBus } from './services/redis-event-bus.service';
import { errorHandler } from './middleware/errorHandler';
import express from 'express';
import logger, { logRequest, logError } from './logger';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const main = async () => {
    await initializeRedis();
    const eventBus = new RedisEventBus();
    app.use(express.json());
    app.use((req, res, next) => {
        const reqId = uuidv4();
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logRequest(req.method, req.path, res.statusCode, duration, reqId);
        });
        next();
    });
    app.use(errorHandler);

    // Example usage
    await eventBus.subscribe('user.created', (data) => {
        logger.info('User created:', data);
    });

    const server = app.listen(3000, () => {
        logger.info('Server is running on port 3000');
    });

    const shutdown = async () => {
        logger.info('Shutting down gracefully...');
        await server.close();
        await eventBus.client.quit();
        await eventBus.subscriber.quit();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

main();
