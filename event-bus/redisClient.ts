import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';
import logger from './logger';

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL,
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

const executeWithTimeout = async (command, args, timeoutMs = 5000) => {
    let timeoutId;
    const promise = command(...args);
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Operation timed out'));
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

(async () => {
    try {
        await connectWithRetry();
    } catch (error) {
        logger.error('Failed to initialize Redis client:', error);
        process.exit(1);
    }
})();

export const publishWithTimeout = async (topic, message) => {
    return await executeWithTimeout(redisClient.publish.bind(redisClient), [topic, JSON.stringify(message)]);
};

export default redisClient;
