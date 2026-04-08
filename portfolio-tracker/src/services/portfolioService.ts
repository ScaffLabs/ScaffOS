import storage from './storage';
import { Portfolio, PortfolioUpdate, HealthCheckResponse } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';
import axios from 'axios';
import logger from './logger';
import { ValidationError, NotFoundError, ServiceError } from '../errors';

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorsThreshold: 2,
    resetTimeout: 10000
});

const portfolioServiceUrl = process.env.PORTFOLIO_SERVICE_URL;

const axiosInstance = axios.create({
    baseURL: portfolioServiceUrl,
});

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const start = process.hrtime();
    if (!data.name || !Array.isArray(data.positions) || data.positions.some(p => !p.symbol || p.quantity < 0 || p.averagePrice < 0)) {
        throw new ValidationError('Invalid portfolio data');
    }
    const newPortfolio = storage.create(data);
    await publishPortfolioUpdate(newPortfolio);
    const duration = process.hrtime(start);
    logger.info('Created portfolio', { duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const start = process.hrtime();
    const portfolio = await circuitBreaker.call(() => axiosInstance.get(`/portfolios/${id}`)).then(res => res.data);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    const duration = process.hrtime(start);
    logger.info('Fetched portfolio', { id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    const start = process.hrtime();
    if (data.positions && data.positions.some(p => !p.symbol || p.quantity < 0 || p.averagePrice < 0)) {
        throw new ValidationError('Invalid portfolio update data');
    }
    const portfolio = await circuitBreaker.call(() => axiosInstance.put(`/portfolios/${id}`, data)).then(res => res.data);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    await publishPortfolioUpdate(portfolio);
    const duration = process.hrtime(start);
    logger.info('Updated portfolio', { id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    return portfolio;
};