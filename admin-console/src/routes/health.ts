import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';
import { ServiceError } from '../errors/CustomErrors';

const router = express.Router();

// Health check endpoint
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
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
    // Here you can add checks for readiness, e.g., database connection, etc.
    try {
        const healthStatus = await fetchHealthStatus();
        if (healthStatus.database === 'down' || healthStatus.externalService === 'down') {
            return res.status(503).json({ message: 'Service not ready' });
        }
        res.status(200).json({ message: 'Service is ready' });
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

export default router;