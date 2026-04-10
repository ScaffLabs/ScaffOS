import express from 'express';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';
import { ServiceError } from '../errors/CustomErrors';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get health status of the application
 *     responses:
 *       200:
 *         description: Health check successful
 *       500:
 *         description: Health check failed
 */
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

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Check if the application is ready
 *     responses:
 *       200:
 *         description: Application is ready
 *       500:
 *         description: Application is not ready
 */
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