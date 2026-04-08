import express from 'express';
import { fetchHealthStatus } from '../services/ServiceClient';
import axios from 'axios';
import { logger } from '../middleware/logger';

const router = express.Router();

const checkServiceHealth = async (serviceUrl: string) => {
    const start = Date.now();
    try {
        const response = await axios.get(serviceUrl);
        const duration = Date.now() - start;
        logger.info(`Checked service health for {serviceUrl} in {duration}ms`);
        return response.status === 200;
    } catch (error) {
        logger.error(`Service health check failed for {serviceUrl}: {error.message}`);
        return false;
    }
};

router.get('/', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        const dbHealth = await checkServiceHealth(process.env.DATABASE_URL);
        const status = {
            serviceHealth: healthStatus,
            database: dbHealth ? 'up' : 'down',
        };
        res.status(200).json(status);
    } catch (error) {
        logger.error(`Failed to fetch health status: {error.message}`);
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

export default router;