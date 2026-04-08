import { Request, Response } from 'express';
import { checkServiceHealth } from './serviceHealth';
import logger from './logger';
import config from './config';
import { createConnectionPool } from './connectionPool';

const connectionPool = createConnectionPool();

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
        logger.error('Health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const readyCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesReady = Object.values(healthStatus).every(status => status);
        res.status(allServicesReady ? 200 : 503).json({ status: allServicesReady ? 'READY' : 'NOT READY' });
    } catch (error) {
        logger.error('Ready check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const checkServiceHealth = async () => {
    const services = ['order', 'user'];
    const results = await Promise.all(services.map(async (service) => {
        try {
            const response = await connectionPool.requestWithRetry(service, 'get', '/health');
            return { service, status: response.status === 'UP' };
        } catch (err) {
            logger.error(`Failed to check health for ${service}: ${err.message}`);
            return { service, status: false };
        }
    }));
    return results.reduce((acc, { service, status }) => ({ ...acc, [service]: status }), {});
};
