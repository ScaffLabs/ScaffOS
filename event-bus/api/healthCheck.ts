import redisClient from './redisClient';
import os from 'os';
import { config } from './config';
import logger from './logger';

const checkHealth = async () => {
    let redisHealthy = false;
    try {
        await redisClient.ping();
        redisHealthy = true;
        logger.info('Redis is healthy');
    } catch (error) {
        logger.error('Redis connection failed', error);
    }

    return { redisHealthy };
};

export const checkHealthEndpoint = async (req, res) => {
    const health = await checkHealth();
    const allHealthy = health.redisHealthy;
    res.status(allHealthy ? 200 : 503).json({ health, memoryUsage: process.memoryUsage(), uptime: process.uptime(), cpuCount: os.cpus().length });
};

export const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    await redisClient.quit();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);