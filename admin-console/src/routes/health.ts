import express from 'express';
import { logger } from '../middleware/logger';
import { healthCheck, readinessCheck } from '../services/HealthService';
import os from 'os';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Returns the health status of the application.
 *     responses:
 *       200:
 *         description: Health status successfully retrieved.
 *       500:
 *         description: Health check failed.
 */
router.get('/', async (req, res) => {
    try {
        const healthStatus = await healthCheck();
        res.status(200).json(healthStatus);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Returns readiness status of the application.
 *     responses:
 *       200:
 *         description: Service is ready.
 *       500:
 *         description: Readiness check failed.
 */
router.get('/ready', async (req, res) => {
    try {
        const status = await readinessCheck();
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Returns system metrics including memory usage and uptime.
 *     responses:
 *       200:
 *         description: System metrics successfully retrieved.
 *       500:
 *         description: Failed to retrieve system metrics.
 */
router.get('/metrics', (req, res) => {
    try {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        res.status(200).json({
            memoryUsage,
            uptime,
            platform: os.platform(),
            arch: os.arch(),
        });
    } catch (error) {
        logger.error(`Failed to retrieve metrics: ${error.message}`);
        res.status(500).json({ error: 'Failed to retrieve system metrics' });
    }
});

export default router;