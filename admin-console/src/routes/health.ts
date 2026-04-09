import express from 'express';
import { logger } from '../middleware/logger';
import os from 'os';
import { healthCheck } from '../services/HealthService';
import config from '../config';
import axios from 'axios';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const externalServiceStatus = await fetchHealthStatus();
        res.status(200).json({
            application: 'running',
            externalService: externalServiceStatus,
        });
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed' });
    }
});

const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/health`);
        return response.data;
    } catch (error) {
        return 'down';
    }
};

export default router;