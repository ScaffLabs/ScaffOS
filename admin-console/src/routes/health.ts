import express from 'express';
import { logger } from '../middleware/logger';
import { healthCheck, readinessCheck } from '../services/HealthService';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        const healthStatus = await healthCheck();
        res.status(200).json(healthStatus);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
    try {
        const readiness = await readinessCheck();
        res.status(200).json(readiness);
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

export default router;