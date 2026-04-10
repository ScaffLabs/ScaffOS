// Import necessary modules
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

// Function to create a new portfolio
export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const start = process.hrtime();
    try {
        PortfolioSchema.parse({ ...portfolioData, id: '' });
    } catch (error) {
        throw new ValidationError('Invalid portfolio data: ' + error.errors.map(e => e.message).join(', '));
    }
    const newPortfolio = storage.create(portfolioData);
    const duration = process.hrtime(start);
    logger.info('Created portfolio', { portfolioId: newPortfolio.id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    await notifyExternalService(newPortfolio);
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
export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new NotFoundError('Portfolio not found');
    return portfolio;
};

// Function to update an existing portfolio
export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) throw new NotFoundError('Portfolio not found');
    try {
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

// Function to delete a portfolio
export const deletePortfolio = async (id: string): Promise<void> => {
    const success = storage.delete(id);
    if (!success) throw new NotFoundError('Portfolio not found');
};

// Fetch all portfolios
export const fetchAllData = async (): Promise<Portfolio[]> => {
    const portfolios = storage.getAll();
    if (!portfolios.length) throw new ServiceError('No portfolios found');
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

// Readiness check for service
export const readinessCheck = async (req: Request, res: Response) => {
    const isServiceReady = await healthCheckExternalService();
    res.status(isServiceReady ? 200 : 503).json({ status: isServiceReady ? 'READY' : 'NOT READY' });
};
