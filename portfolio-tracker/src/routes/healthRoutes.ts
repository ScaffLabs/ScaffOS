import { Router } from 'express';
import { healthCheck, readinessCheck } from '../services/healthService';
import logger from '../services/logger';
import axios from 'axios';
import env from '../config';

const router = Router();

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const checkExternalServiceHealth = async () => {
    try {
        const response = await axios.get(`${externalPortfolioServiceUrl}/health`);
        return response.data.status === 'UP';
    } catch (error) {
        logger.warn('External service is down', { error: error.message });
        return false;
    }
};

router.get('/health', async (req, res) => {
    try {
        const isExternalServiceUp = await checkExternalServiceHealth();
        res.json({ status: 'UP', externalService: isExternalServiceUp });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const isExternalServiceUp = await checkExternalServiceHealth();
        res.status(isExternalServiceUp ? 200 : 503).json({ status: isExternalServiceUp ? 'READY' : 'NOT READY' });
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({ status: 'NOT READY', error: error.message });
    }
});

export default router;