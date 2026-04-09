import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import { closePool } from '../utils/connectionPool';
import logger from '../utils/logger';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const serviceHealth = await fetchServiceHealth();
        res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const readinessCheck = async (req: Request, res: Response) => {
    try {
        const health = await fetchServiceHealth();
        if (health.status !== 'UP') {
            return res.status(503).send({ status: 'DOWN', details: health });
        }
        res.status(200).send({ status: 'READY' });
    } catch (err) {
        res.status(503).send({ status: 'DOWN', error: err.message });
    }
};

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
    app.get('/api/ready', readinessCheck);
};
