import { initializeRedis } from './config/redis.config';
import { RedisEventBus } from './services/redis-event-bus.service';
import { errorHandler } from './middleware/errorHandler';
import express from 'express';

const app = express();
const main = async () => {
    await initializeRedis();
    const eventBus = new RedisEventBus();
    app.use(express.json());
    app.use(errorHandler);

    // Example usage
    await eventBus.subscribe('user.created', (data) => {
        console.log('User created:', data);
    });

    const server = app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        await server.close();
        await eventBus.client.quit();
        await eventBus.subscriber.quit();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

main();