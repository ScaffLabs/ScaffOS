import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
    url: 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    await redisClient.connect();
})();

export default redisClient;