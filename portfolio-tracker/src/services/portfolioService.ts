import { Portfolio, PortfolioUpdate, PortfolioSchema, PositionSchema } from '../types';
import storage from './storage';
import { ValidationError, NotFoundError } from '../errors';
import { logPortfolioCreation, logPortfolioUpdate, logPortfolioDeletion } from './auditService';
import { publishPortfolioUpdate } from '../eventBus';

export const createPortfolio = async (portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    try {
        PortfolioSchema.parse({ ...portfolioData, id: '' }); // Assign a temporary ID
        portfolioData.positions.forEach(pos => PositionSchema.parse(pos));
    } catch (error) {
        throw new ValidationError('Invalid portfolio data');
    }
    const newPortfolio = storage.create(portfolioData);
    await logPortfolioCreation(newPortfolio);
    publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const updatePortfolio = async (id: string, updates: PortfolioUpdate): Promise<Portfolio> => {
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
    return updatedPortfolio;
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const success = storage.delete(id);
    if (!success) {
        throw new NotFoundError('Portfolio not found');
    }
    await logPortfolioDeletion(id);
};