// health.ts
import express from 'express';
import { checkServiceHealth } from './interServiceClient';
import config from './config';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    const userServiceHealthy = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    const orderServiceHealthy = await checkServiceHealth(`${config.ORDER_SERVICE_URL}/health`);
    const status = userServiceHealthy && orderServiceHealthy ? 'healthy' : 'unhealthy';
    res.status(200).json({ services: [{ service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' }, { service: 'Order Service', status: orderServiceHealthy ? 'healthy' : 'unhealthy' }] });
});

router.get('/ready', async (req, res) => {
    const userServiceReady = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    const orderServiceReady = await checkServiceHealth(`${config.ORDER_SERVICE_URL}/health`);
    if (userServiceReady && orderServiceReady) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'unhealthy' });
});

export default router;