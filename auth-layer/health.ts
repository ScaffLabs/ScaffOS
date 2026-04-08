import express from 'express';
import axios from 'axios';
import config from './config';
import logger from './logger';

const router = express.Router();

const checkServiceHealth = async (serviceName: string, url: string) => {
    try {
        await axios.get(url);
        return { service: serviceName, status: 'healthy' };
    } catch (error) {
        logger.error(`Health check failed for ${serviceName}`, { error: error.message });
        return { service: serviceName, status: 'unhealthy' };
    }
};

router.get('/health', async (req, res) => {
    const userServiceHealth = await checkServiceHealth('User Service', `${config.USER_SERVICE_URL}/health`);
    const otherServiceHealth = await checkServiceHealth('Other Service', `${config.OTHER_SERVICE_URL}/health`);
    res.status(200).json({ services: [userServiceHealth, otherServiceHealth] });
});

router.get('/ready', async (req, res) => {
    const isDatabaseReady = await connectionPool.isReady();
    if (!isDatabaseReady) {
        return res.status(503).json({ status: 'not ready' });
    }
    res.status(200).json({ status: 'ready' });
});

export default router;
