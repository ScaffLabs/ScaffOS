import { Request, Response } from 'express';
import axios from 'axios';

const SERVICE_URLS = {
    strategyService: process.env.STRATEGY_SERVICE_URL,
};

const checkServiceHealth = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const dependentHealthCheckHandler = async (req: Request, res: Response) => {
    const healthResults = await Promise.all(
        Object.entries(SERVICE_URLS).map(async ([serviceName, url]) => {
            const isHealthy = await checkServiceHealth(url);
            return { serviceName, healthy: isHealthy };
        })
    );
    res.status(200).json({ dependencies: healthResults });
};
