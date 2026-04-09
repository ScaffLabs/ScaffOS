import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';
import logger from './logger';

const redisClient: RedisClientType = createClient({
    url: 'redis://localhost:6379',
});

const connectWithRetry = async (retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await redisClient.connect();
            logger.info('Connected to Redis');
            return;
        } catch (error) {
            logger.error('Redis connection failed, retrying...', error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Failed to connect to Redis after several attempts');
};

redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
});

(async () => {
    try {
        await connectWithRetry();
    } catch (error) {
        logger.error('Failed to initialize Redis client:', error);
        process.exit(1);
    }
})();

const timeout = promisify(setTimeout);
redisClient.on('commandError', async (command) => {
    logger.error(`Command ${command} failed due to timeout`);
    await timeout(5000); // Retry mechanism or error handling can be implemented here
});

export default redisClient;

const gracefulShutdown = async () => {
    try {
        logger.info('Shutting down Redis client gracefully...');
        await redisClient.quit();
        logger.info('Redis client closed');
        process.exit(0);
    } catch (error) {
        logger.error('Error during Redis shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);