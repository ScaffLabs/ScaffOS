import { Portfolio, PortfolioUpdate, PortfolioSchema, PositionSchema } from '../types';
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

const validatePositions = (positions: Position[]) => {
    positions.forEach((pos) => {
        const result = PositionSchema.safeParse(pos);
        if (!result.success) {
            throw new ValidationError(result.error.errors.map(err => err.message).join(', '));
        }
    });
};

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    PortfolioSchema.parse(portfolioData); // Validate input
    validatePositions(portfolioData.positions);
    const newPortfolio = storage.create(portfolioData);
    await logPortfolioCreation(newPortfolio);
    // Notify external service and publish event
    publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
    const existingPortfolio = storage.read(id);
    if (!existingPortfolio) {
        throw new NotFoundError('Portfolio not found');
    }
    if (updates.positions) {
        validatePositions(updates.positions);
    }
    const updatedPortfolio = storage.update(id, updates);
    await logPortfolioUpdate(id, updates);
    publishPortfolioUpdate(updatedPortfolio);
    return updatedPortfolio;
};