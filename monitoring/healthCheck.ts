import { Request, Response } from 'express';
import { checkServiceHealth } from './serviceHealth';
import logger from './logger';

const getMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    return {
        total: memoryUsage.rss / (1024 * 1024),
        used: memoryUsage.heapUsed / (1024 * 1024),
        heapTotal: memoryUsage.heapTotal / (1024 * 1024),
        heapUsed: memoryUsage.heapUsed / (1024 * 1024),
    };
};

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesUp = Object.values(healthStatus).every(status => status);
        const memoryStats = getMemoryUsage();
        res.status(allServicesUp ? 200 : 503).json({
            status: allServicesUp ? 'UP' : 'DOWN',
            services: healthStatus,
            memory: memoryStats,
        });
    } catch (error) {
        logger.error({ error: error.message }, 'Health check failed');
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};