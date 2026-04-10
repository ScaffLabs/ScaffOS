import { Request, Response } from 'express';
import axios from 'axios';
import { logError } from '../utils/errorLogger';

const SERVICES = {
    strategyService: process.env.STRATEGY_SERVICE_URL || 'http://localhost:3001/api/health',
};

const checkServiceHealth = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        logError(error, `Health check failed for ${url}`);
        return false;
    }
};

export const dependentHealthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthResults = await Promise.all(Object.entries(SERVICES).map(async ([name, url]) => {
            const healthy = await checkServiceHealth(url);
            return { serviceName: name, healthy };
        }));
        const allHealthy = healthResults.every(dep => dep.healthy);
        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ready' : 'not ready',
            dependencies: healthResults,
        });
    } catch (error) {
        console.error('Dependent health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
