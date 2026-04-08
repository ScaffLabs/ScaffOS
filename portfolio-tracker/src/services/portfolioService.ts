import storage from './storage';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from '../errors';
import { CircuitBreaker } from 'opossum';

const circuitBreakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
};

const createPortfolioCircuit = new CircuitBreaker(createPortfolioInternal, circuitBreakerOptions);

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    return await createPortfolioCircuit.fire(data);
};

const createPortfolioInternal = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    if (!data.name || !Array.isArray(data.positions) || data.positions.length === 0) {
        throw new ValidationError('Invalid portfolio data. Name and positions are required.');
    }
    for (const position of data.positions) {
        if (!position.symbol || position.quantity < 0 || position.averagePrice < 0) {
            throw new ValidationError('Each position must have a valid symbol, non-negative quantity, and non-negative average price.');
        }
    }
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
    if (data.name && typeof data.name !== 'string') {
        throw new ValidationError('Portfolio name must be a string.');
    }
    if (data.positions) {
        for (const position of data.positions) {
            if (!position.symbol || position.quantity < 0 || position.averagePrice < 0) {
                throw new ValidationError('Each position must be valid with a symbol, non-negative quantity, and non-negative average price.');
            }
        }
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

export const clearPortfolios = () => {
    storage.clear();
};
