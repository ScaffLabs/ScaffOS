import { Request, Response } from 'express';
import logger from './logger';
import axios from 'axios';
import env from '../config';
import { checkExternalPortfolioService } from './portfolioService';

const axiosInstance = axios.create({
    timeout: 5000, // Timeout after 5 seconds
});

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
        await checkExternalPortfolioService();
        res.status(200).json({ status: 'READY' });
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({ status: 'NOT READY', error: error.message });
    }
};
