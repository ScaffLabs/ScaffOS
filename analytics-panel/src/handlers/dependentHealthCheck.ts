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

export const readyCheckHandler = async (req: Request, res: Response) => {
    try {
        // Check dependencies (e.g., database, external services)
        const services = await Promise.all([
            // Mock service checks
            { name: 'Service A', healthy: true },
            { name: 'Service B', healthy: false },
        ]);
        res.status(200).json({ status: 'ready', services });
    } catch (error) {
        console.error('Ready check for dependencies failed:', error);
        res.status(500).json({ error: 'Ready check failed.' });
    }
};
