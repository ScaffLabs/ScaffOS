import express from 'express';
import { logger } from '../middleware/logger';
import { healthCheck } from '../services/HealthService';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check for the application
 *     responses:
 *       200:
 *         description: Health check successful
 *       500:
 *         description: Health check failed
 */
router.get('/', async (req, res) => {
    try {
        const status = await healthCheck();
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness check for the application
 *     responses:
 *       200:
 *         description: Application is ready
 *       500:
 *         description: Application is not ready
 */
router.get('/ready', async (req, res) => {
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(500).json({ status: 'not ready' });
    }
});

const checkDatabaseConnection = async () => {
    // Implement logic to check DB connection here
    return true; // Replace with actual check
};

export default router;