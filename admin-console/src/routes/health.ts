import express from 'express';
import { logger } from '../middleware/logger';
import os from 'os';
import { healthCheck } from '../services/HealthService';
import config from '../config';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const status = await healthCheck();
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

router.get('/ready', async (req, res) => {
    try {
        // Here we can check if essential services like DB are connected
        const dbStatus = await checkDatabaseConnection(); // Implement this in your DB service
        if (dbStatus) {
            res.status(200).json({ status: 'ready' });
        } else {
            res.status(500).json({ status: 'not ready' });
        }
    } catch (error) {
        logger.error(`Readiness check failed: ${error.message}`);
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

const checkDatabaseConnection = async () => {
    // Implement logic to check DB connection here
    return true; // Replace with actual check
};

export default router;