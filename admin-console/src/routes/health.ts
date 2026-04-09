import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';
import { ServiceError } from '../errors/CustomErrors';
import { healthCheck } from '../services/HealthService';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const status = await healthCheck();
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed: ' + error.message });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const health = await fetchHealthStatus();
        const isReady = health && health.application === 'running' && health.database === 'up';
        if (isReady) {
            res.status(200).json({ status: 'ready' });
        } else {
            res.status(500).json({ status: 'not ready' });
        }
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed: ' + error.message });
    }
});

export default router;