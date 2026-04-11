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

const notifyExternalService = async (portfolio: Portfolio) => {
    try {
        await breaker.run(() => axios.post(`${externalPortfolioServiceUrl}/notify`, portfolio));
    } catch (error) {
        logger.error('Failed to notify external service', { error: error.message });
    }
};

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

// other functions remain unchanged