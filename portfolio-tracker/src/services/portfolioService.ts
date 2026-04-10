import { Portfolio, PortfolioUpdate, PortfolioSchema, PositionSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import { logPortfolioCreation, logPortfolioUpdate, logPortfolioDeletion } from './auditService';
import { publishPortfolioUpdate } from '../eventBus';
import logger from './logger';
import axios from 'axios';
import { CircuitBreaker } from 'circuit-breaker-js';

const externalServiceBreaker = new CircuitBreaker();
const externalServiceUrl = process.env.PORTFOLIO_SERVICE_URL;

const fetchExternalServiceData = async (endpoint: string) => {
    return await externalServiceBreaker.run(async () => {
        const response = await axios.get(`${externalServiceUrl}/${endpoint}`);
        return response.data;
    });
};

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const start = process.hrtime();
    try {
        PortfolioSchema.parse({ ...portfolioData, id: '' });
        portfolioData.positions.forEach(pos => PositionSchema.parse(pos));
    } catch (error) {
        throw new ValidationError('Invalid portfolio data');
    }
    const newPortfolio = storage.create(portfolioData);
    await logPortfolioCreation(newPortfolio);
    publishPortfolioUpdate(newPortfolio);
    const duration = process.hrtime(start);
    logger.info('Created portfolio', { portfolioId: newPortfolio.id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    return newPortfolio;
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const start = process.hrtime();
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    if (updates.positions) {
        updates.positions.forEach(pos => PositionSchema.parse(pos));
    }
    const updatedPortfolio = storage.update(id, updates);
    await logPortfolioUpdate(id, updates);
    publishPortfolioUpdate(updatedPortfolio);
    const duration = process.hrtime(start);
    logger.info('Updated portfolio', { portfolioId: id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
    return updatedPortfolio;
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const start = process.hrtime();
    const success = storage.delete(id);
    if (!success) {
        throw new NotFoundError('Portfolio not found');
    }
    await logPortfolioDeletion(id);
    const duration = process.hrtime(start);
    logger.info('Deleted portfolio', { portfolioId: id, duration: (duration[0] * 1e3 + duration[1] / 1e6).toFixed(3) });
};

export const fetchAllExternalPortfolios = async () => {
    try {
        const portfolios = await fetchExternalServiceData('');
        return portfolios;
    } catch (error) {
        logger.error('Failed to fetch external portfolios', { error: error.message });
        throw new ServiceError('Error fetching external portfolios');
    }
};