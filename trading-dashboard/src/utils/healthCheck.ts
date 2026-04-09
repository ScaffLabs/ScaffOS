import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';

export const healthCheck = async (req: Request, res: Response) => {
    const serviceHealth = await fetchServiceHealth();
    res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
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
