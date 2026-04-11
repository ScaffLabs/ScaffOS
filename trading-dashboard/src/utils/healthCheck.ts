import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import logger from '../utils/logger';
import process from 'process';
import { withRetryAndTimeout } from '../utils/retry';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds timeout for health checks

const healthCheckWithRetry = async () => {
    const health = await withRetryAndTimeout(fetchServiceHealth, 3, 1000, HEALTH_CHECK_TIMEOUT);
    return { status: 'UP', health };
};

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const result = await healthCheckWithRetry();
        res.status(200).json({ ...result, uptime, memoryUsage });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
};

export const registerHealthRoutes = (app) => {
    app.get('/api/health', healthCheck);
    app.get('/api/ready', (req: Request, res: Response) => {
        res.status(200).json({ status: 'READY' });
    });
};

export const gracefulShutdown = async (req: Request, res: Response, next: Function) => {
    res.on('finish', () => {
        logger.info('Graceful shutdown initiated...');
    });
    next();
};

process.on('SIGTERM', () => {
    logger.info('SIGTERM received: shutting down gracefully...');
});
process.on('SIGINT', () => {
    logger.info('SIGINT received: shutting down gracefully...');
});
