import express from 'express';
import { healthCheckService, checkServiceHealth } from './interServiceClient';
import config from './config';
import logger from './logger';

const router = express.Router();

router.get('/health', async (req, res) => {
    const userServiceHealthy = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    res.status(200).json({ services: [{ service: 'User Service', status: userServiceHealthy ? 'healthy' : 'unhealthy' }] });
});

router.get('/ready', async (req, res) => {
    const userServiceReady = await checkServiceHealth(`${config.USER_SERVICE_URL}/health`);
    if (userServiceReady) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'unhealthy' });
});

router.get('/service-health', async (req, res) => {
    const services = ['User Service', 'Order Service'];
    const healthChecks = await Promise.all(services.map(async (service) => {
        const isHealthy = await checkServiceHealth(`${config[`${service.replace(/ /g, '_').toUpperCase()}_SERVICE_URL`]}/health`);
        return { service, status: isHealthy ? 'healthy' : 'unhealthy' };
    }));
    res.status(200).json({ healthChecks });
});

export default router;