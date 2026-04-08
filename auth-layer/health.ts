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
    res.status(200).json({ services: [userServiceHealth] });
});

router.get('/ready', async (req, res) => {
    // Simple readiness check, could be expanded later
    res.status(200).json({ status: 'ready' });
});

export default router;