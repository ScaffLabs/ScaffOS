import storage from './storage';
import { Portfolio, PortfolioUpdate, HealthCheckResponse } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';
import axios from 'axios';
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

axiosInstance.interceptors.response.use(null, async (error) => {
    const { config } = error;
    if (!config || !config.__isRetryRequest) {
        config.__isRetryRequest = true;
        await new Promise(res => setTimeout(res, 1000)); // wait before retrying
        return axiosInstance(config);
    }
    return Promise.reject(error);
});

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    if (!data.name || !Array.isArray(data.positions) || data.positions.some(p => !p.symbol || p.quantity < 0 || p.averagePrice < 0)) {
        throw new ValidationError('Invalid portfolio data');
    }
    const newPortfolio = storage.create(data);
    await publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = await circuitBreaker.call(() => axiosInstance.get(`/portfolios/${id}`)).then(res => res.data);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    if (data.positions && data.positions.some(p => !p.symbol || p.quantity < 0 || p.averagePrice < 0)) {
        throw new ValidationError('Invalid portfolio update data');
    }
    const portfolio = await circuitBreaker.call(() => axiosInstance.put(`/portfolios/${id}`, data)).then(res => res.data);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    await publishPortfolioUpdate(portfolio);
    return portfolio;
};

export const deletePortfolio = async (id: string): Promise<boolean> => {
    const deleted = await circuitBreaker.call(() => axiosInstance.delete(`/portfolios/${id}`));
    return deleted.status === 204;
};

export const fetchPortfolios = async ({ limit, offset, sort, order }): Promise<Portfolio[]> => {
    const response = await circuitBreaker.call(() => axiosInstance.get('/portfolios', { params: { limit, offset, sort, order } }));
    if (!response.data) throw new ServiceError('Failed to fetch portfolios');
    return response.data;
};

export const healthCheckPortfolioService = async (): Promise<HealthCheckResponse> => {
    try {
        await axiosInstance.get('/health');
        return { status: 'UP', portfolioService: true };
    } catch (error) {
        return { status: 'DOWN', portfolioService: false, error: error.message };
    }
};

export const clearPortfolios = () => {
    storage.clear();
};
