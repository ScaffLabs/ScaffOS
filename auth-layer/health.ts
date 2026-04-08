import express from 'express';
import { checkUserServiceHealth, checkOrderServiceHealth } from './interServiceClient';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const userServiceHealthy = await checkUserServiceHealth();
        const orderServiceHealthy = await checkOrderServiceHealth();

        const status = userServiceHealthy && orderServiceHealthy ? 'healthy' : 'unhealthy';
        res.status(200).json({
            status,
            services: [
                { service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' },
                { service: 'Order Service', status: orderServiceHealthy ? 'healthy' : 'unhealthy' }
            ],
        });
    } catch (error) {
        logger.error('Health check error', { error: error.message });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

export default router;