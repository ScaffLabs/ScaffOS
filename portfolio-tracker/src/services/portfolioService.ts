import { Portfolio, PortfolioUpdate } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const { name, positions } = portfolioData;
    if (!name || !positions || positions.length === 0) {
        throw new ValidationError('Name and positions are required.');
    }
    try {
        return storage.create(portfolioData);
    } catch (error) {
        throw new Error('Error creating portfolio: ' + error.message);
    }
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    return portfolio;
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    if (updates.positions && updates.positions.length === 0) {
        throw new ValidationError('Positions array cannot be empty.');
    }
    try {
        return storage.update(id, updates);
    } catch (error) {
        throw new Error('Error updating portfolio: ' + error.message);
    }
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const deleted = storage.delete(id);
    if (!deleted) {
        throw new NotFoundError('Portfolio not found');
    }
};

export const fetchPortfolios = async (options: { limit: number; offset: number; sort: string; order: string; }): Promise<Portfolio[]> => {
    try {
        const portfolios = storage.getAll();
        const sortedPortfolios = portfolios.sort((a, b) => {
            if (options.sort === 'name') {
                return options.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            return 0;
        });
        return sortedPortfolios.slice(options.offset, options.offset + options.limit);
    } catch (error) {
        throw new Error('Error fetching portfolios: ' + error.message);
    }
};