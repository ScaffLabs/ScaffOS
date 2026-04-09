import { Request, Response } from 'express';
import logger from './logger';
import axios from 'axios';
import env from '../config';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const portfolioServiceStatus = await checkExternalPortfolioService();
        res.json({
            status: 'UP',
            portfolioService: portfolioServiceStatus,
        });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
};

export const readinessCheck = async (req: Request, res: Response) => {
    try {
        const portfolioServiceStatus = await checkExternalPortfolioService();
        if (!portfolioServiceStatus) {
            return res.status(503).json({ status: 'NOT READY', error: 'Portfolio service is down' });
        }
        res.status(200).json({ status: 'READY' });
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({ status: 'NOT READY', error: error.message });
    }
};

const checkExternalPortfolioService = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${externalPortfolioServiceUrl}/health`);
        return response.data.status === 'UP';
    } catch (error) {
        logger.error('External service health check failed', { error: error.message });
        return false;
    }
};