// src/services/portfolioService.ts
import storage from './storage';
import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from '../errors';
import axios from 'axios';
import CircuitBreaker from 'opossum';
import env from '../config';

const circuitBreakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
};

const serviceCircuit = new CircuitBreaker(createPortfolioInternal, circuitBreakerOptions);

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    // Validate data against schema
    const validationResult = PortfolioSchema.safeParse(data);
    if (!validationResult.success) {
        throw new ValidationError(validationResult.error.errors.map(e => e.message).join(', '));
    }
    return await serviceCircuit.fire(data);
};

const createPortfolioInternal = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const newPortfolio = storage.create(data);
    await publishPortfolioUpdate(newPortfolio);
    logger.info('Created portfolio', { id: newPortfolio.id });
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) {
        throw new NotFoundError('Portfolio not found.');
    }
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    const portfolio = await getPortfolio(id);
    const validationResult = PortfolioSchema.partial().safeParse({ ...portfolio, ...data });
    if (!validationResult.success) {
        throw new ValidationError(validationResult.error.errors.map(e => e.message).join(', '));
    }
    const updatedPortfolio = storage.update(id, data);
    if (!updatedPortfolio) {
        throw new NotFoundError('Portfolio not found for update.');
    }
    await publishPortfolioUpdate(updatedPortfolio);
    return updatedPortfolio;
};

export const fetchPortfolios = async (): Promise<Portfolio[]> => {
    return storage.getAll();
};

export const checkExternalServiceAvailability = async (url: string): Promise<boolean> => {
    try {
        await axios.get(url);
        return true;
    } catch (error) {
        logger.error('External service not reachable', { url, error: error.message });
        return false;
    }
};

export const healthCheck = async () => {
    const portfolioServiceStatus = await checkExternalServiceAvailability(env.PORTFOLIO_SERVICE_URL);
    return {
        portfolioService: portfolioServiceStatus,
    };
};