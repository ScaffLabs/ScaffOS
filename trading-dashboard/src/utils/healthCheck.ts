import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import { closePool } from '../utils/connectionPool';
import logger from '../utils/logger';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const serviceHealth = await fetchServiceHealth();
        res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const gracefulShutdown = (server: any) => {
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        await closePool();
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });
    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received: closing HTTP server');
        await closePool();
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });
};

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
};