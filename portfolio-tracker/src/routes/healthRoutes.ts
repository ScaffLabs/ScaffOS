import { Router } from 'express';
import logger from '../services/logger';
import axios from 'axios';
import env from '../config';
import circuitBreaker from 'circuit-breaker-js';

const router = Router();

const externalHealthCheckUrl = `${env.PORTFOLIO_SERVICE_URL}/health`;
const TIMEOUT = 5000;
const MAX_RETRIES = 3;

const breaker = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

const checkExternalServiceHealth = async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await breaker.run(() => axios.get(externalHealthCheckUrl, { timeout: TIMEOUT }));
            return response.data.status === 'UP';
        } catch (error) {
            logger.warn('Health check failed', { attempt, error: error.message });
            if (attempt === MAX_RETRIES) {
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
        }
    }
    return false;
};

router.get('/health', async (req, res) => {
    const isPortfolioServiceUp = await checkExternalServiceHealth();
    res.json({ status: isPortfolioServiceUp ? 'UP' : 'DOWN' });
});

router.get('/ready', async (req, res) => {
    const isPortfolioServiceReady = await checkExternalServiceHealth();
    res.status(isPortfolioServiceReady ? 200 : 503).json({ status: isPortfolioServiceReady ? 'READY' : 'NOT READY' });
});

export default router;