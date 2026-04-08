import express from 'express';
import { checkServiceHealth } from './interServiceClient';
import config from './config';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const userServiceHealthy = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
        const orderServiceHealthy = await checkServiceHealth(`${config.ORDER_SERVICE_URL}/health`);
        const status = userServiceHealthy && orderServiceHealthy ? 'healthy' : 'unhealthy';
        res.status(200).json({ status, services: [{ service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' }, { service: 'Order Service', status: orderServiceHealthy ? 'healthy' : 'unhealthy' }] });
    } catch (error) {
        logger.error('Health check error', { error: error.message });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const userServiceReady = await checkServiceHealth(`${config.USER_SERVICE_URL}/ready`);
        const orderServiceReady = await checkServiceHealth(`${config.ORDER_SERVICE_URL}/ready`);
        if (userServiceReady && orderServiceReady) {
            return res.status(200).json({ status: 'ready' });
        }
        res.status(503).json({ status: 'unhealthy' });
    } catch (error) {
        logger.error('Readiness check error', { error: error.message });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

export default router;
