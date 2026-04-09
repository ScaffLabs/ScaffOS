import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError, ServiceError } from '../errors';
import axios from 'axios';
import env from '../config';
import circuitBreaker from 'circuit-breaker-js';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const circuit = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const validation = PortfolioSchema.safeParse(portfolioData);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    try {
        const newPortfolio = storage.create(portfolioData);
        await notifyPortfolioUpdate(newPortfolio);
        return newPortfolio;
    } catch (error) {
        throw new ServiceError('Error creating portfolio: ' + error.message);
    }
};

const notifyPortfolioUpdate = async (portfolio: Portfolio) => {
    try {
        await circuit.run(() => axios.post(`${externalPortfolioServiceUrl}/updates`, portfolio));
    } catch (error) {
        console.error('Failed to notify portfolio update:', error);
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
    const validation = PortfolioSchema.partial().safeParse(updates);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    try {
        const updatedPortfolio = storage.update(id, updates);
        await notifyPortfolioUpdate(updatedPortfolio);
        return updatedPortfolio;
    } catch (error) {
        throw new ServiceError('Error updating portfolio: ' + error.message);
    }
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const deleted = storage.delete(id);
    if (!deleted) {
        throw new NotFoundError('Portfolio not found');
    }
};

export const fetchPortfolios = async ({ limit, offset, sort, order }): Promise<Portfolio[]> => {
    try {
        return storage.getAll().slice(offset, offset + limit);
    } catch (error) {
        throw new ServiceError('Error fetching portfolios: ' + error.message);
    }
};

export const healthCheckExternalService = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${externalPortfolioServiceUrl}/health`);
        return response.data.status === 'UP';
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};
