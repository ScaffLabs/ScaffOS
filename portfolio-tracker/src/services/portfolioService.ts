import { Portfolio, PortfolioUpdate } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError, ServiceError } from '../errors';
import axios from 'axios';
import env from '../config';
import circuitBreaker from 'circuit-breaker-js';
import { logPortfolioCreation, logPortfolioUpdate, logPortfolioDeletion } from './auditService';
import { publishPortfolioUpdate } from '../eventBus';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const circuit = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

const validatePositions = (positions: any[]) => {
    if (!Array.isArray(positions) || positions.length === 0) {
        throw new ValidationError('Positions must be a non-empty array.');
    }
    positions.forEach((pos) => {
        if (!pos.symbol || typeof pos.quantity !== 'number' || pos.quantity < 0 || typeof pos.averagePrice !== 'number' || pos.averagePrice < 0) {
            throw new ValidationError('Invalid position data. Ensure symbol is provided and quantities are non-negative.');
        }
    });
};

const notifyExternalService = async (portfolio: Portfolio) => {
    try {
        await axios.post(`${externalPortfolioServiceUrl}/notifications`, portfolio);
    } catch (error) {
        throw new ServiceError('Failed to notify external service: ' + error.message);
    }
};

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    try {
        validatePositions(portfolioData.positions);
        const newPortfolio = storage.create(portfolioData);
        await logPortfolioCreation(newPortfolio);
        await notifyExternalService(newPortfolio);
        publishPortfolioUpdate(newPortfolio);
        return newPortfolio;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ServiceError('Failed to create portfolio: ' + error.message);
    }
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    try {
        if (updates.positions) {
            validatePositions(updates.positions);
        }
        const updatedPortfolio = storage.update(id, updates);
        await logPortfolioUpdate(id, updates);
        await notifyExternalService(updatedPortfolio);
        publishPortfolioUpdate(updatedPortfolio);
        return updatedPortfolio;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ServiceError('Failed to update portfolio: ' + error.message);
    }
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const deleted = storage.delete(id);
    if (!deleted) {
        throw new NotFoundError('Portfolio not found');
    }
    await logPortfolioDeletion(id);
    publishPortfolioUpdate({ id, deleted: true });
};