import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';

const redisClient: RedisClientType = createClient({
    url: 'redis://localhost:6379',
});

const connectWithRetry = async (retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await redisClient.connect();
            console.log('Connected to Redis');
            return;
        } catch (error) {
            console.error('Redis connection failed, retrying...', error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Failed to connect to Redis after several attempts');
};

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    await connectWithRetry();
})();

export default redisClient;
