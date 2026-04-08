import express from 'express';
import { healthCheckServices } from './externalService';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    const healthStatus = await healthCheckServices();
    const isHealthy = Object.values(healthStatus).every(status => status);
    const status = isHealthy ? 'healthy' : 'unhealthy';
    logger.info(`Health check status: ${status}`);
    res.status(isHealthy ? 200 : 503).json({ status, dependencies: healthStatus });
});

export default router;
