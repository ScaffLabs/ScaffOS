import express from 'express';
import { logger } from '../middleware/logger';
import { healthCheckWithRetry } from '../services/HealthService';
import { fetchHealthStatus } from '../services/ServiceClient';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const status = await healthCheckWithRetry();
        res.status(200).json({
            application: 'running',
            database: status.database,
            externalService: status.externalService,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        });
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed: ' + error.message });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        if (healthStatus.application === 'running') {
            res.status(200).json({ status: 'ready' });
        } else {
            res.status(503).json({ status: 'not ready' });
        }
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed: ' + error.message });
    }
});

export default router;