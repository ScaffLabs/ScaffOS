import { Request, Response } from 'express';
import logger from './logger';
import { healthCheckPortfolioService } from './portfolioService';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const portfolioServiceStatus = await healthCheckPortfolioService();
        res.json({ status: 'UP', portfolioService: portfolioServiceStatus });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
};

export const healthCheckPortfolioService = async (): Promise<boolean> => {
    // Simulating health check logic for external services if needed
    return true;
};
