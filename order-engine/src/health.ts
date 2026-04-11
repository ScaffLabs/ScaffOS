import { Request, Response } from 'express';
import { performHealthChecks } from './axiosClient';
import logger from './logger';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const isHealthy = await performHealthChecks();
        if (isHealthy) {
            res.status(200).send('Order Engine is healthy!');
        } else {
            res.status(503).send('Dependent services are down.');
        }
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).send('Health check error.');
    }
};

export const readyCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const isReady = await performHealthChecks();
        if (isReady) {
            res.status(200).send('Order Engine is ready!');
        } else {
            res.status(503).send('Dependent services are not ready.');
        }
    } catch (error) {
        logger.error('Readiness check failed:', error);
        res.status(500).send('Readiness check error.');
    }
};

process.on('SIGINT', () => {
    logger.info('Received SIGINT: Performing health check before shutdown.');
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM: Performing health check before shutdown.');
});