import axios from 'axios';
import { ServiceError } from '../errors/customErrors';

const SERVICES = {
    strategyService: process.env.STRATEGY_SERVICE_URL || 'http://localhost:3001/api/health',
};

const checkServiceHealth = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const dependentHealthCheck = async () => {
    const healthResults = await Promise.all(Object.entries(SERVICES).map(async ([name, url]) => {
        const healthy = await checkServiceHealth(url);
        return { serviceName: name, healthy };
    }));
    return healthResults;
};

export const healthCheckHandler = async (req: Request, res: Response) => {
    try {
        const dependencies = await dependentHealthCheck();
        const allHealthy = dependencies.every(dep => dep.healthy);
        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ready' : 'not ready',
            dependencies,
        });
    } catch (error) {
        console.error('Dependent health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};