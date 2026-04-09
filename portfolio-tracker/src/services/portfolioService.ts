import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
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

// Notify external service of portfolio changes
const notifyPortfolioService = async (portfolio: Portfolio) => {
    try {
        await circuit.call(() => axios.post(`${externalPortfolioServiceUrl}/notify`, portfolio));
    } catch (error) {
        console.error('Error notifying external portfolio service:', error);
    }
};

// Validate position entries in portfolio
const validatePositions = (positions) => {
    if (!Array.isArray(positions) || positions.length === 0) {
        throw new ValidationError('Positions must be a non-empty array.');
    }
    positions.forEach(position => {
        if (!position.symbol || typeof position.quantity !== 'number' || position.quantity < 0 || typeof position.averagePrice !== 'number' || position.averagePrice < 0) {
            throw new ValidationError('Invalid position data. Ensure symbol is provided and quantities are non-negative.');
        }
    });
};

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    // Validate the portfolio data against the schema
    const validation = PortfolioSchema.omit({ id: true }).safeParse(portfolioData);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    // Validate positions if provided
    validatePositions(portfolioData.positions);
    try {
        const newPortfolio = storage.create(portfolioData);
        await logPortfolioCreation(newPortfolio);
        await notifyPortfolioService(newPortfolio);
        return newPortfolio;
    } catch (error) {
        throw new ServiceError('Error creating portfolio: ' + error.message);
    }
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    // Check if the portfolio exists
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    // Validate the provided updates
    const validation = PortfolioSchema.partial().safeParse(updates);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    // Validate positions if updates include them
    if (updates.positions) {
        validatePositions(updates.positions);
    }
    try {
        const updatedPortfolio = storage.update(id, updates);
        await logPortfolioUpdate(id, updates);
        await notifyPortfolioService(updatedPortfolio);
        return updatedPortfolio;
    } catch (error) {
        throw new ServiceError('Error updating portfolio: ' + error.message);
    }
};

export const deletePortfolio = async (id: string): Promise<void> => {
    // Attempt to delete the portfolio
    const deleted = storage.delete(id);
    if (!deleted) {
        throw new NotFoundError('Portfolio not found');
    }
    await logPortfolioDeletion(id);
};

export const fetchExternalPortfolioData = async () => {
    try {
        const response = await circuit.call(() => axios.get(`${externalPortfolioServiceUrl}/data`));
        return response.data;
    } catch (error) {
        console.error('Failed to fetch external portfolio data:', error);
        throw new ServiceError('Could not fetch external data');
    }
};

export const syncWithExternalService = async () => {
    const externalData = await fetchExternalPortfolioData();
    externalData.forEach(portfolio => {
        storage.create(portfolio);
    });
};