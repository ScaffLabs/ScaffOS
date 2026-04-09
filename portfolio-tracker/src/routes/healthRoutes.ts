import { Router } from 'express';
import { healthCheck, readinessCheck } from '../services/healthService';
import logger from '../services/logger';

const router = Router();

router.get('/health', async (req, res) => {
    try {
        await healthCheck(req, res);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
});

router.get('/ready', async (req, res) => {
    try {
        await readinessCheck(req, res);
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(500).json({ status: 'NOT READY', error: error.message });
    }
});

export default router;
