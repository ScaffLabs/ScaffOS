import storage from './storage';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';
import axios from 'axios';
import { retry } from 'async';

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorsThreshold: 2,
    resetTimeout: 10000
});

const retryOptions = {
    times: 5,
    interval: (attempt) => Math.pow(2, attempt) * 1000 // Exponential backoff
};

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    if (!data.name || !Array.isArray(data.positions)) {
        throw new Error('Invalid portfolio data');
    }
    const newPortfolio = storage.create(data);
    await publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new Error('Portfolio not found');
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    const portfolio = storage.update(id, data);
    if (!portfolio) throw new Error('Portfolio not found');
    await publishPortfolioUpdate(portfolio);
    return portfolio;
};

export const deletePortfolio = async (id: string): Promise<boolean> => {
    const deleted = storage.delete(id);
    if (!deleted) throw new Error('Portfolio not found');
    return deleted;
};

export const fetchPortfolios = async ({ limit, offset, sort, order }): Promise<Portfolio[]> => {
    const portfolios = storage.getAll();
    const sortedPortfolios = portfolios.sort((a, b) => {
        const comparison = a[sort] < b[sort] ? -1 : 1;
        return order === 'asc' ? comparison : -comparison;
    });
    return sortedPortfolios.slice(offset, offset + limit);
};

export const healthCheckPortfolioService = async (): Promise<boolean> => {
    try {
        await retry(async (times) => {
            return await axios.get(process.env.PORTFOLIO_SERVICE_URL);
        }, retryOptions);
        return true;
    } catch (error) {
        throw new Error('Portfolio service unreachable');
    }
};

export const clearPortfolios = () => {
    storage.clear();
};
