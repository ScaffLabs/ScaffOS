import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import logger from '../utils/logger';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const serviceHealth = await fetchServiceHealth();
        const health = {
            status: serviceHealth.status,
            timestamp: new Date().toISOString(),
            services: {
                external: serviceHealth.status
            }
        };
        res.status(200).send(health);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
};
