import express from 'express';
import { healthCheckService } from './interServiceClient';
import config from './config';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    const userServiceHealth = await healthCheckService(`${config.USER_SERVICE_URL}/health`);
    res.status(200).json({ services: [{ service: 'User Service', status: userServiceHealth.status }] });
});

router.get('/ready', async (req, res) => {
    const userServiceHealth = await healthCheckService(`${config.USER_SERVICE_URL}/health`);
    if (userServiceHealth.status === 'healthy') {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'unhealthy' });
});

export default router;