import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import logger from './logger';
import axios from 'axios';
import env from '../config';
import { ServiceError } from '../errors';
import circuitBreaker from 'circuit-breaker-js';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const breaker = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const start = process.hrtime();
    try {
        PortfolioSchema.parse({ ...portfolioData, id: '' });
    } catch (error) {
        throw new ValidationError('Invalid portfolio data');
    }
    const newPortfolio = storage.create(portfolioData);
    const duration = process.hrtime(start);
    logger.info('Created portfolio', { portfolioId: newPortfolio.id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    await notifyExternalService(newPortfolio);
    return newPortfolio;
};

const notifyExternalService = async (portfolio: Portfolio) => {
    try {
        await breaker.run(() => axios.post(`${externalPortfolioServiceUrl}/notify`, portfolio));
    } catch (error) {
        logger.error('Failed to notify external service', { error: error.message });
    }
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    return portfolio;
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) throw new NotFoundError('Portfolio not found');
    const updatedPortfolio = storage.update(id, updates);
    await notifyExternalService(updatedPortfolio);
    return updatedPortfolio;
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const success = storage.delete(id);
    if (!success) throw new NotFoundError('Portfolio not found');
};

export const fetchAllData = async (): Promise<Portfolio[]> => {
    return storage.getAll();
};