import express from 'express';
import { healthCheckServices } from './externalService';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const healthStatus = await healthCheckServices();
        const isHealthy = Object.values(healthStatus).every(status => status);
        const status = isHealthy ? 'healthy' : 'unhealthy';
        logger.info(`Health check status: ${status}`);
        res.status(isHealthy ? 200 : 503).json({ status, dependencies: healthStatus });
    } catch (error) {
        logger.error('Health check error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/ready', async (req, res) => {
    try {
        // Check if the service is ready to handle requests
        const readyStatus = await healthCheckServices();
        const isReady = Object.values(readyStatus).every(status => status);
        const status = isReady ? 'ready' : 'not ready';
        logger.info(`Readiness check status: ${status}`);
        res.status(isReady ? 200 : 503).json({ status });
    } catch (error) {
        logger.error('Readiness check error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;