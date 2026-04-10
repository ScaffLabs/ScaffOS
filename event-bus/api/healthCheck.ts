import redisClient from './redisClient';
import axios from 'axios';
import { config } from './config';
import logger from './logger';

const checkHealth = async () => {
    let redisHealthy = false;
    let serviceHealthy = false;

    try {
        await redisClient.ping();
        redisHealthy = true;
        logger.info('Redis is healthy');
    } catch (error) {
        logger.error('Redis connection failed', error);
    }

    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        serviceHealthy = response.status === 200;
        logger.info('Other service is healthy');
    } catch (error) {
        logger.error('Other service connection failed', error);
    }

    return { redisHealthy, serviceHealthy };
};

export const checkHealthEndpoint = async (req, res) => {
    const health = await checkHealth();
    const allHealthy = health.redisHealthy && health.serviceHealthy;
    res.status(allHealthy ? 200 : 503).json({ health });
};

export const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    await redisClient.quit();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export const healthCheckMiddleware = async (req, res, next) => {
    try {
        const health = await checkHealth();
        req.health = health;
        next();
    } catch (error) {
        logger.error('Health check middleware error:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
};

export const readyCheck = async (req, res) => {
    const isHealthy = await checkHealth();
    res.status(isHealthy.redisHealthy && isHealthy.serviceHealthy ? 200 : 503).json({ ready: isHealthy });
};
