// Import necessary modules
import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import logger from './logger';
import axios from 'axios';
import env from '../config';
import { ServiceError } from '../errors';
import circuitBreaker from 'circuit-breaker-js';
import { publishPortfolioUpdate } from '../eventBus';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const breaker = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

// Function to create a new portfolio
export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    try {
        PortfolioSchema.parse(portfolioData);
    } catch (error) {
        throw new ValidationError('Invalid portfolio data: ' + error.errors.map(e => e.message).join(', '));
    }
    const newPortfolio = storage.create(portfolioData);
    logger.info('Created portfolio', { portfolioId: newPortfolio.id });
    await notifyExternalService(newPortfolio);
    publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

// Notify external service about the portfolio creation
const notifyExternalService = async (portfolio: Portfolio) => {
    try {
        await breaker.run(() => axios.post(`${externalPortfolioServiceUrl}/notify`, portfolio));
    } catch (error) {
        logger.error('Failed to notify external service', { error: error.message });
    }
};

// Function to retrieve a portfolio by its ID
export const getPortfolio = async (id: PortfolioId): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    return portfolio;
};

// Function to update an existing portfolio
export const updatePortfolio = async (id: PortfolioId, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) throw new NotFoundError('Portfolio not found');
    try {
        PortfolioSchema.parse({ ...existingPortfolio, ...updates });
    } catch (error) {
        throw new ValidationError('Invalid update data: ' + error.errors.map(e => e.message).join(', '));
    }
    const updatedPortfolio = storage.update(id, updates);
    await notifyExternalService(updatedPortfolio);
    publishPortfolioUpdate(updatedPortfolio);
    return updatedPortfolio;
};

// Function to delete a portfolio
export const deletePortfolio = async (id: PortfolioId): Promise<void> => {
    const success = storage.delete(id);
    if (!success) throw new NotFoundError('Portfolio not found');
};

// Fetch all portfolios
export const fetchAllData = async (): Promise<Portfolio[]> => {
    const portfolios = storage.getAll();
    return portfolios;
};

// Health check for external service
export const healthCheckExternalService = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${externalPortfolioServiceUrl}/health`);
        return response.data.status === 'UP';
    } catch (err) {
        logger.error('Health check failed for external service', { error: err.message });
        return false;
    }
};
