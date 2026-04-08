import { Request, Response } from 'express';
import { dependentHealthCheck } from '../api/analytics';

export const dependentHealthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthResults = await dependentHealthCheck();
        res.status(200).json({ dependencies: healthResults });
    } catch (error) {
        console.error('Dependent health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};