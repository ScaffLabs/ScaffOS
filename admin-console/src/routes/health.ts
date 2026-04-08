import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        const serviceHealth = {
            application: 'running',
            database: healthStatus.database === 'up' ? 'up' : 'down',
            externalService: healthStatus.externalService === 'up' ? 'up' : 'down',
        };
        res.status(200).json(serviceHealth);
    } catch (error) {
        logger.error(`Health check failed: {error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

export default router;