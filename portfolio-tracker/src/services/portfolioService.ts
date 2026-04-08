import storage from './storage';
import { Portfolio, PortfolioUpdate, HealthCheckResponse } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';
import axios from 'axios';
import { migrateData, seedData } from './migration';

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorsThreshold: 2,
    resetTimeout: 10000
});

// Migration and seeding
export const initializeStorage = async (): Promise<void> => {
    await seedData(); // Seed initial data for development
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

export const healthCheckPortfolioService = async (): Promise<HealthCheckResponse> => {
    // Health check logic here...
};

export const clearPortfolios = () => {
    storage.clear();
};
