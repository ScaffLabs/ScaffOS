import { Router } from 'express';
import logger from '../services/logger';
import axios from 'axios';
import env from '../config';

const router = Router();

const checkExternalServiceHealth = async (serviceUrl: string) => {
    try {
        const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
        return response.data.status === 'UP';
    } catch (error) {
        logger.warn('External service is down', { error: error.message });
        return false;
    }
};

router.get('/health', async (req, res) => {
    const isPortfolioServiceUp = await checkExternalServiceHealth(env.PORTFOLIO_SERVICE_URL);
    res.json({ status: 'UP', portfolioService: isPortfolioServiceUp });
});

router.get('/ready', async (req, res) => {
    const isPortfolioServiceReady = await checkExternalServiceHealth(env.PORTFOLIO_SERVICE_URL);
    res.status(isPortfolioServiceReady ? 200 : 503).json({ status: isPortfolioServiceReady ? 'READY' : 'NOT READY' });
});

export default router;
