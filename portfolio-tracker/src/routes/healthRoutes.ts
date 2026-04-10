import { Router } from 'express';
import logger from '../services/logger';
import axios from 'axios';
import env from '../config';

const router = Router();

const checkExternalServiceHealth = async (serviceUrl: string) => {
    try {
        const response = await axios.get(`${serviceUrl}/health`);
        return response.data.status === 'UP';
    } catch (error) {
        logger.warn('External service is down', { error: error.message });
        return false;
    }
};

router.get('/health', async (req, res) => {
    const portfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;
    const isPortfolioServiceUp = await checkExternalServiceHealth(portfolioServiceUrl);
    res.json({ status: 'UP', portfolioService: isPortfolioServiceUp });
});

router.get('/ready', async (req, res) => {
    const portfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;
    const isPortfolioServiceReady = await checkExternalServiceHealth(portfolioServiceUrl);
    res.status(isPortfolioServiceReady ? 200 : 503).json({ status: isPortfolioServiceReady ? 'READY' : 'NOT READY' });
});

router.get('/metrics', async (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const portfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;
    const isPortfolioServiceUp = await checkExternalServiceHealth(portfolioServiceUrl);

    res.json({
        uptime,
        memoryUsage,
        portfolioService: isPortfolioServiceUp,
    });
});

export default router;