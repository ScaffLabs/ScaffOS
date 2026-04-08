import { Portfolio, PortfolioUpdate } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import axios from 'axios';
import env from '../config';
import { CircuitBreaker } from 'circuit-breaker-js';

const axiosInstance = axios.create({
    baseURL: env.PORTFOLIO_SERVICE_URL,
    timeout: 5000,
});

const circuitBreaker = new CircuitBreaker();

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const { name, positions } = portfolioData;
    if (!name || positions.length === 0) {
        throw new ValidationError('Name and positions are required.');
    }
    return storage.create(portfolioData);
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
    return storage.update(id, updates);
};

export const checkExternalPortfolioService = async () => {
    try {
        await circuitBreaker.fire(() => axiosInstance.get('/'));
        return true;
    } catch (error) {
        throw new Error('Portfolio service is down');
    }
};

export const fetchPortfolios = async (options: { limit: number; offset: number; sort: string; order: string; }): Promise<Portfolio[]> => {
    const { limit, offset, sort, order } = options;
    const portfolios = storage.getAll();
    const sortedPortfolios = portfolios.sort((a, b) => {
        if (sort === 'name') {
            return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        return 0;
    });
    return sortedPortfolios.slice(offset, offset + limit);
};

export const clearPortfolios = () => {
    storage.clear();
};
