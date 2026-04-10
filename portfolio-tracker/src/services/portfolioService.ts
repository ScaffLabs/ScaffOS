import { Portfolio, PortfolioUpdate, PortfolioSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import logger from './logger';
import axios from 'axios';
import env from '../config';
import { ServiceError } from '../errors';
import circuitBreaker from 'circuit-breaker-js';

const externalPortfolioServiceUrl = env.PORTFOLIO_SERVICE_URL;

const breaker = circuitBreaker({
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

/**
 * Creates a new portfolio.
 * Validates the portfolio data before creation to ensure it conforms to the schema.
 * Notifies an external service about the new portfolio creation.
 * @param portfolioData - The portfolio data to create.
 * @returns The newly created portfolio.
 */
export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const start = process.hrtime();
    try {
        // Validate the incoming portfolio data against the defined schema
        PortfolioSchema.parse({ ...portfolioData, id: '' });
    } catch (error) {
        throw new ValidationError('Invalid portfolio data: ' + error.errors.map(e => e.message).join(', '));
    }
    // Create the new portfolio in storage
    const newPortfolio = storage.create(portfolioData);
    const duration = process.hrtime(start);
    logger.info('Created portfolio', { portfolioId: newPortfolio.id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    // Notify external services about the new portfolio
    await notifyExternalService(newPortfolio);
    return newPortfolio;
};

/**
 * Notify the external service about a newly created portfolio.
 * Uses a circuit breaker pattern to handle potential failures in communication.
 * @param portfolio - The portfolio to notify about.
 */
const notifyExternalService = async (portfolio: Portfolio) => {
    try {
        // Execute notification to the external service within the circuit breaker context
        await breaker.run(() => axios.post(`${externalPortfolioServiceUrl}/notify`, portfolio));
    } catch (error) {
        logger.error('Failed to notify external service', { error: error.message });
    }
};

/**
 * Retrieves a portfolio by its ID.
 * Throws an error if the portfolio does not exist.
 * @param id - The ID of the portfolio to retrieve.
 * @returns The requested portfolio.
 */
export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    return portfolio;
};

/**
 * Updates an existing portfolio.
 * Validates the new data before applying updates to ensure data integrity.
 * Notifies an external service about the updated portfolio.
 * @param id - The ID of the portfolio to update.
 * @param updates - The updates to apply to the portfolio.
 * @returns The updated portfolio.
 */
export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) throw new NotFoundError('Portfolio not found');
    try {
        // Validate updates against the schema
        if (updates.name) PortfolioSchema.shape.name.parse(updates.name);
        if (updates.positions) {
            updates.positions.forEach(pos => {
                if (!pos.symbol || typeof pos.quantity !== 'number' || pos.quantity < 0 || typeof pos.averagePrice !== 'number' || pos.averagePrice < 0) {
                    throw new ValidationError('Invalid position data. Ensure symbol is provided and quantities are non-negative.');
                }
            });
        }
    } catch (error) {
        throw new ValidationError('Invalid update data: ' + error.errors.map(e => e.message).join(', '));
    }
    const updatedPortfolio = storage.update(id, updates);
    await notifyExternalService(updatedPortfolio);
    return updatedPortfolio;
};

/**
 * Deletes a portfolio by its ID.
 * Throws an error if the portfolio does not exist.
 * @param id - The ID of the portfolio to delete.
 */
export const deletePortfolio = async (id: string): Promise<void> => {
    const success = storage.delete(id);
    if (!success) throw new NotFoundError('Portfolio not found');
};

/**
 * Fetches all portfolios.
 * Throws an error if no portfolios are found.
 * @returns An array of all portfolios.
 */
export const fetchAllData = async (): Promise<Portfolio[]> => {
    const portfolios = storage.getAll();
    if (!portfolios.length) throw new ServiceError('No portfolios found');
    return portfolios;
};