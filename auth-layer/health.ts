import express from 'express';
import { checkUserServiceHealth, checkOrderServiceHealth } from './interServiceClient';
import logger from './logger';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const userServiceHealthy = await checkUserServiceHealth();
        const orderServiceHealthy = await checkOrderServiceHealth();

        const status = userServiceHealthy && orderServiceHealthy ? 'healthy' : 'unhealthy';
        res.status(200).json({
            status,
            services: [
                { service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' },
                { service: 'Order Service', status: orderServiceHealthy ? 'healthy' : 'unhealthy' },
            ],
        });
    } catch (error) {
        logger.error('Health check error', { error: error.message });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
    try {
        const userServiceHealthy = await checkUserServiceHealth();
        const orderServiceHealthy = await checkOrderServiceHealth();
        const isReady = userServiceHealthy && orderServiceHealthy;
        res.status(isReady ? 200 : 503).json({
            ready: isReady,
            services: [
                { service: 'User Service', ready: userServiceHealthy },
                { service: 'Order Service', ready: orderServiceHealthy },
            ],
        });
    } catch (error) {
        logger.error('Readiness check error', { error: error.message });
        res.status(500).json({ ready: false, error: error.message });
    }
});

export default router;
