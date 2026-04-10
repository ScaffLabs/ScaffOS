import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import logger from '../utils/logger';
import process from 'process';

/** * Health check endpoint to return service status and metrics. * @param req * @param res */
export const healthCheck = async (req: Request, res: Response) => {
    try {
        const externalHealth = await fetchServiceHealth();
        const health = {
            status: externalHealth.status,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString(),
            services: {
                external: externalHealth.status,
            },
        };
        res.status(200).send(health);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

/** * Register health check routes. * @param app */
export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
};
