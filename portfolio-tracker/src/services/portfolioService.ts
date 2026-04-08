import axios from 'axios';
import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';

const PORTFOLIO_SERVICE_URL = process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3001/api/portfolios';
const circuitBreaker = new CircuitBreaker({ timeout: 3000, errorsThreshold: 2, resetTimeout: 10000 });

let portfolios: Portfolio[] = [];

const retryRequest = async (fn: Function, retries: number = 3, delay: number = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(res => setTimeout(res, delay));
        return await retryRequest(fn, retries - 1, delay * 2);
    }
};

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

export const fetchPortfolios = async (): Promise<Portfolio[]> => {
    return portfolios;
};

export const clearPortfolios = () => {
    portfolios = [];
};

export const healthCheckPortfolioService = async (): Promise<boolean> => {
    try {
        await retryRequest(() => axios.get(PORTFOLIO_SERVICE_URL));
        return true;
    } catch (error) {
        return false;
    }
};

export const healthCheckAllServices = async (): Promise<{ [key: string]: boolean }> => {
    const status: { [key: string]: boolean } = {};
    status.portfolioService = await healthCheckPortfolioService();
    return status;
};