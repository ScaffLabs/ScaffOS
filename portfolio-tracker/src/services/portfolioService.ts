import axios from 'axios';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';

const PORTFOLIO_SERVICE_URL = process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3001/api/portfolios';
const circuitBreaker = new CircuitBreaker({ timeout: 3000, errorsThreshold: 2, resetTimeout: 10000 });

let portfolios: Portfolio[] = [];

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    if (!data.name || !Array.isArray(data.positions)) {
        throw new Error('Invalid portfolio data');
    }
    const newPortfolio: Portfolio = { id: String(portfolios.length + 1), ...data };
    portfolios.push(newPortfolio);
    await publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio | undefined> => {
    const portfolio = portfolios.find(portfolio => portfolio.id === id);
    if (!portfolio) throw new Error('Portfolio not found');
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio | undefined> => {
    const portfolio = await getPortfolio(id);
    if (!portfolio) throw new Error('Portfolio not found');
    Object.assign(portfolio, data);
    await publishPortfolioUpdate(portfolio);
    return portfolio;
};

const retryRequest = async (fn: Function) => {
    for (let i = 0; i < 3; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === 2) throw error;
        }
    }
};

export const fetchPortfolios = async () => {
    return await retryRequest(async () => {
        const response = await circuitBreaker.fire(() => axios.get(PORTFOLIO_SERVICE_URL));
        return response.data;
    });
};

export const healthCheckPortfolioService = async (): Promise<boolean> => {
    try {
        await axios.get(PORTFOLIO_SERVICE_URL);
        return true;
    } catch (error) {
        return false;
    }
};

export const fetchAllPortfolios = async (): Promise<Portfolio[]> => {
    return portfolios;
};

export const clearPortfolios = () => {
    portfolios = [];
};
