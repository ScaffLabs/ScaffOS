import { Request, Response } from 'express';
import { healthCheck } from '../api/analytics';
import { logError } from '../utils/errorLogger';

export const healthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthStatus = await healthCheck();
        res.status(200).json({ status: 'up', dependencies: healthStatus });
    } catch (error) {
        logError(error, 'Health check handler');
        res.status(503).json({ status: 'down', error: error.message });
    }
};

export const dependentHealthCheckHandler = async (req: Request, res: Response) => {
    // Additional logic for dependent health checks can be implemented here
};