import { Router } from 'express';
import logger from '../services/logger';
import { healthCheck, healthCheckExternalService } from '../services/healthService';

const router = Router();

router.get('/health', healthCheck);

router.get('/ready', async (req, res) => {
    try {
        const isPortfolioServiceReady = await healthCheckExternalService();
        res.status(isPortfolioServiceReady ? 200 : 503).json({ status: isPortfolioServiceReady ? 'READY' : 'NOT READY' });
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({ status: 'NOT READY' });
    }
});

export default router;