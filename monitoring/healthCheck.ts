import { Request, Response } from 'express';
import { checkServiceHealth } from './serviceHealth';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesUp = Object.values(healthStatus).every(status => status);
        res.status(allServicesUp ? 200 : 503).json({ status: allServicesUp ? 'UP' : 'DOWN', services: healthStatus });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const readyCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesUp = Object.values(healthStatus).every(status => status);
        res.status(allServicesUp ? 200 : 503).json({ status: allServicesUp ? 'READY' : 'NOT READY' });
    } catch (error) {
        console.error('Ready check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const memoryHealthCheck = (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.rss / (1024 * 1024);
    const usedMemory = memoryUsage.heapUsed / (1024 * 1024);
    res.status(200).json({ status: 'UP', memory: { total: totalMemory, used: usedMemory } });
};
