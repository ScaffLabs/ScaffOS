import { Portfolio, PortfolioUpdate } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError, ServiceError } from '../errors';
import axios from 'axios';
import env from '../config';
import circuitBreaker from 'circuit-breaker-js';
import { logPortfolioCreation, logPortfolioUpdate, logPortfolioDeletion } from './auditService';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const circuit = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const validation = PortfolioSchema.omit({ id: true }).safeParse(portfolioData);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    validatePositions(portfolioData.positions);
    const newPortfolio = storage.create(portfolioData);
    await logPortfolioCreation(newPortfolio);
    await notifyPortfolioService(newPortfolio);
    return newPortfolio;
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
    if (updates.positions) {
        validatePositions(updates.positions);
    }
    const updatedPortfolio = storage.update(id, updates);
    await logPortfolioUpdate(id, updates);
    await notifyPortfolioService(updatedPortfolio);
    return updatedPortfolio;
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const deleted = storage.delete(id);
    if (!deleted) {
        throw new NotFoundError('Portfolio not found');
    }
    await logPortfolioDeletion(id);
};

export const performTransaction = async (actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> => {
    return storage.transaction(actions, portfolioIds);
};

export const indexBy = async (field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> => {
    return storage.indexBy(field);
};