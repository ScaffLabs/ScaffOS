import express from 'express';
import { logger } from '../middleware/logger';
import { healthCheck } from '../services/HealthService';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const status = await healthCheck();
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const isReady = await checkDatabaseConnection();
        if (isReady) {
            res.status(200).json({ status: 'ready' });
        } else {
            res.status(500).json({ status: 'not ready' });
        }
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

const checkDatabaseConnection = async () => {
    // Implement logic to check DB connection here
    // For example, ping the database or check a connection pool
    return true; // Replace with actual check logic
};

export default router;