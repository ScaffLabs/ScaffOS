import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import logger from '../utils/logger';
import process from 'process';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds timeout for health checks

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const externalHealthPromise = fetchServiceHealth();
        const healthCheckPromise = new Promise((resolve) => {
            const health = {
                status: 'UP',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString(),
            };
            resolve(health);
        });

        const result = await Promise.race([
            externalHealthPromise,
            healthCheckPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT))
        ]);

        res.status(200).send(result);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
};
