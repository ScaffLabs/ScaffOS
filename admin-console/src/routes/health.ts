import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        res.status(200).json(healthStatus);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const status = await fetchHealthStatus();
        if (status.application === 'running') {
            return res.status(200).json({ message: 'Service is ready' });
        }
        res.status(503).json({ message: 'Service not ready' });
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

export default router;