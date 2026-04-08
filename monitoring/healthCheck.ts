import { Request, Response } from 'express';
import { checkServiceHealth } from './serviceHealth';
import logger from './logger';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesUp = Object.values(healthStatus).every(status => status);
        logger.info({ healthStatus, allServicesUp }, 'Health check performed');
        res.status(allServicesUp ? 200 : 503).json({ status: allServicesUp ? 'UP' : 'DOWN', services: healthStatus });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const readyCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        const allServicesReady = Object.values(healthStatus).every(status => status);
        logger.info({ healthStatus, allServicesReady }, 'Readiness check performed');
        res.status(allServicesReady ? 200 : 503).json({ status: allServicesReady ? 'READY' : 'NOT READY' });
    } catch (error) {
        logger.error('Ready check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};