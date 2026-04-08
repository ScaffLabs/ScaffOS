import { Request, Response } from 'express';
import logger from './logger';
import { healthCheckPortfolioService } from './portfolioService';
import { redisClient } from './redis';
import { dbPool } from './db';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const portfolioServiceStatus = await healthCheckPortfolioService();
        const redisStatus = await checkRedis();
        const dbStatus = await checkDatabase();

        res.json({
            status: 'UP',
            portfolioService: portfolioServiceStatus,
            redis: redisStatus,
            database: dbStatus,
        });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
};

const checkRedis = async () => {
    return new Promise((resolve) => {
        redisClient.ping((err, result) => {
            if (err) return resolve(false);
            resolve(result === 'PONG');
        });
    });
};

const checkDatabase = async () => {
    try {
        await dbPool.query('SELECT 1');
        return true;
    } catch (error) {
        return false;
    }
};
