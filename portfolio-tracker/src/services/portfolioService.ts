import storage from './storage';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from '../errors';
import { CircuitBreaker } from 'opossum';

const circuitBreakerOptions = {
    timeout: 3000, // timeout after 3 seconds
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

const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            logger.warn(`Retrying due to error: ${error.message}`);
            await new Promise(res => setTimeout(res, delay));
            return retry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

// The rest of the portfolioService functions remain unchanged.