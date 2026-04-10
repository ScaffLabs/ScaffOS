import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';
import { ServiceError } from '../errors/CustomErrors';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const status = await fetchHealthStatus();
        res.status(200).json({
            application: 'running',
            database: status.database,
            externalService: status.externalService
        });
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

router.get('/live', async (req, res) => {
    try {
        // Check if the service is alive
        const health = await fetchHealthStatus();
        res.status(200).json({ status: 'alive', health });
    } catch (error) {
        logger.error(`Live check failed: ${error.message}`);
        res.status(500).json({ error: 'Live check failed: ' + error.message });
    }
});

export default router;