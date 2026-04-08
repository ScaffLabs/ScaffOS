import express from 'express';
import { checkServiceHealth } from './externalService';
import logger from './logger';

const router = express.Router();
let isReady = true;

const checkDependencies = async (): Promise<{ eventBus: boolean; anotherService: boolean }> => {
    const eventBusHealth = await checkServiceHealth(process.env.EVENT_BUS_URL);
    const anotherServiceHealth = await checkServiceHealth(process.env.ANOTHER_SERVICE_URL);
    return { eventBus: eventBusHealth, anotherService: anotherServiceHealth };
};

router.get('/health', async (req, res) => {
    const dependencies = await checkDependencies();
    const allHealthy = Object.values(dependencies).every(status => status);
    const status = allHealthy ? 'healthy' : 'unhealthy';
    logger.info(`Health check status: ${status}`);
    res.status(allHealthy ? 200 : 503).json({ status, dependencies });
});

router.get('/ready', (req, res) => {
    isReady ? res.status(200).json({ status: 'ready' }) : res.status(503).json({ status: 'not ready' });
});

export const setReady = (ready: boolean) => {
    isReady = ready;
};

export default router;
