// portfolioService.ts
import storage from './storage';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from '../errors';

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
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
        throw new NotFoundError('Portfolio not found');
    }
    logger.info('Fetched portfolio', { id });
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
    }

    if (data.positions) {
        for (const position of data.positions) {
            if (!position.symbol || position.quantity < 0 || position.averagePrice < 0) {
                throw new ValidationError('Each position must have a valid symbol, non-negative quantity, and non-negative average price.');
            }
        }
    }

    const updatedPortfolio = storage.update(id, data);
    await publishPortfolioUpdate(updatedPortfolio);
    logger.info('Updated portfolio', { id });
    return updatedPortfolio;
};

export const fetchPortfolios = async (): Promise<Portfolio[]> => {
    return storage.getAll();
};

export const clearPortfolios = () => {
    storage.clear();
};
