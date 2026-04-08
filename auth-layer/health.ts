import express from 'express';
import { healthCheckService } from './interServiceClient';
import config from './config';
import logger from './logger';

const router = express.Router();

const checkServiceHealth = async (serviceUrl: string) => {
    try {
        const response = await healthCheckService(serviceUrl);
        return response.status === 'healthy';
    } catch (error) {
        logger.error(`Service health check failed for ${serviceUrl}`, { error: error.message });
        return false;
    }
};

router.get('/health', async (req, res) => {
    const userServiceHealthy = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    res.status(200).json({ services: [{ service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' }] });
});

router.get('/ready', async (req, res) => {
    const userServiceReady = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    if (userServiceReady) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'unhealthy' });
});

export default router;