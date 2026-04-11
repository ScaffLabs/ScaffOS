import { Request, Response } from 'express';
import logger from './logger';
import axios from 'axios';
import env from '../config';
import { ServiceError } from '../errors';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;
const TIMEOUT = 5000;
const MAX_RETRIES = 3;

const checkExternalPortfolioService = async (): Promise<boolean> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.get(`${externalPortfolioServiceUrl}/health`, { timeout: TIMEOUT });
            return response.data.status === 'UP';
        } catch (error) {
            logger.warn('Health check attempt failed', { attempt, error: error.message });
            if (attempt === MAX_RETRIES) {
                throw new ServiceError('External service is down after multiple attempts');
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
        }
    }
    return false;
};

export const healthCheckExternalService = async () => {
    try {
        const status = await checkExternalPortfolioService();
        return status;
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        throw new ServiceError('Health check failed');
    }
};

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const isHealthy = await healthCheckExternalService();
        res.status(200).json({ status: isHealthy ? 'UP' : 'DOWN' });
    } catch (error) {
        logger.error('Health check error', { error: error.message });
        res.status(503).json({ status: 'DOWN' });
    }
};
