import { Request, Response } from 'express';
import { checkServiceHealth } from './serviceHealth';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        res.status(200).json({ status: 'UP', services: healthStatus });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const readyCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesUp = Object.values(healthStatus).every(status => status);
        res.status(allServicesUp ? 200 : 503).json({ status: allServicesUp ? 'READY' : 'NOT READY' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};