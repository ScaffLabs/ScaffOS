import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';
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
router.get('/ready', async (req, res) => {
    try {
        const services = await healthCheckDependentServices();
        const allHealthy = services.every(service => service.healthy);
        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ready' : 'not ready',
            services
        });
    } catch (error) {
        console.error('Ready check failed:', error);
        res.status(500).json({ error: 'Ready check failed.' });
    }
});

export default router;