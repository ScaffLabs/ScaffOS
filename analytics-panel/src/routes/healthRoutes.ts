import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';
import { readyCheckHandler } from '../handlers/readyCheck';
import { healthCheckDependentServices } from '../api/analytics';

const router = Router();

router.get('/health', healthCheckHandler);
router.get('/health/dependencies', async (req, res) => {
    try {
        const healthResults = await healthCheckDependentServices();
        res.status(200).json({ dependencies: healthResults });
    } catch (error) {
        console.error('Dependent health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/ready', readyCheckHandler);

export default router;