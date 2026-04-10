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

// Ready check endpoint
router.get('/ready', async (req, res) => {
    try {
        // Assume readiness check involves checking DB connection
        const dbReady = await checkDatabaseConnection();
        res.status(dbReady ? 200 : 503).json({ status: dbReady ? 'ready' : 'not ready' });
    } catch (error) {
        logger.error('Readiness check error', { error: error.message });
        res.status(500).json({ status: 'not ready', error: error.message });
    }
});

const checkDatabaseConnection = async () => {
    try {
        await pool.query('SELECT 1'); // Assuming pool is defined globally
        return true;
    } catch (error) {
        logger.error('Database connection check failed', { error: error.message });
        return false;
    }
};

export default router;