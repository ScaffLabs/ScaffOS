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

export const readinessCheck = async (req: Request, res: Response) => {
    try {
        const health = await fetchServiceHealth();
        if (health.status !== 'UP') {
            return res.status(503).send({ status: 'DOWN', details: health });
        }
        res.status(200).send({ status: 'READY' });
    } catch (err) {
        res.status(503).send({ status: 'DOWN', error: err.message });
    }
};

export const gracefulShutdown = async () => {
    logger.info('Graceful shutdown initiated. Closing database connections.');
    await closePool();
    logger.info('Database connections closed.');
};

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
    app.get('/api/ready', readinessCheck);
};

export const registerShutdownHandlers = (server: any) => {
    const shutdown = async () => {
        await gracefulShutdown();
        server.close(() => {
            logger.info('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};