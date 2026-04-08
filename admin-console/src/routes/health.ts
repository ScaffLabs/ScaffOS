import express from 'express';
import { logger } from '../middleware/logger';
import os from 'os';
import { healthCheck } from '../services/HealthService';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const healthStatus = await healthCheck();
        res.status(200).json(healthStatus);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const serviceHealth = await healthCheck();
        if (serviceHealth.database === 'down') {
            return res.status(503).json({ message: 'Service is not ready' });
        }
        res.status(200).json({ message: 'Service is ready' });
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

router.get('/metrics', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    res.status(200).json({
        memoryUsage,
        uptime,
        platform: os.platform(),
        arch: os.arch(),
    });
});

export default router;