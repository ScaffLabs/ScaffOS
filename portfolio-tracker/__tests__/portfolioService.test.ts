import { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, fetchAllData } from '../src/services/portfolioService';
import { Portfolio } from '../src/types';
import { validPortfolio, invalidPortfolio, existingPortfolioId, nonExistentPortfolioId } from './fixtures/portfolioFixtures';

let testPortfolio: Portfolio;

beforeEach(() => {
    // Clear storage before each test
    clearStorage();
    testPortfolio = { id: existingPortfolioId, name: 'Test Portfolio', positions: [] };
});

describe('Portfolio Service', () => {
    test('should create a valid portfolio', async () => {
        const portfolio = await createPortfolio(validPortfolio);
        expect(portfolio).toHaveProperty('id');
        expect(portfolio.name).toBe(validPortfolio.name);
        expect(portfolio.positions).toEqual(validPortfolio.positions);
    });

    test('should throw an error when creating a portfolio with invalid data', async () => {
        await expect(createPortfolio(invalidPortfolio)).rejects.toThrow('Invalid portfolio data');
    });

    test('should get a portfolio by id', async () => {
        await createPortfolio(testPortfolio);
        const portfolio = await getPortfolio(existingPortfolioId);
        expect(portfolio).toEqual(testPortfolio);
    });

    test('should throw an error when getting a non-existent portfolio', async () => {
        await expect(getPortfolio(nonExistentPortfolioId)).rejects.toThrow('Portfolio not found');
    });

    test('should update a portfolio', async () => {
        await createPortfolio(testPortfolio);
        const updatedPortfolio = await updatePortfolio(existingPortfolioId, { name: 'Updated Name' });
        expect(updatedPortfolio.name).toBe('Updated Name');
    });

    test('should throw an error when updating a non-existent portfolio', async () => {
        await expect(updatePortfolio(nonExistentPortfolioId, { name: 'Updated Name' })).rejects.toThrow('Portfolio not found');
    });

    test('should delete a portfolio', async () => {
        await createPortfolio(testPortfolio);
        await deletePortfolio(existingPortfolioId);
        await expect(getPortfolio(existingPortfolioId)).rejects.toThrow('Portfolio not found');
    });

    test('should throw an error for deleting a non-existent portfolio', async () => {
        await expect(deletePortfolio(nonExistentPortfolioId)).rejects.toThrow('Portfolio not found');
    });

    test('should return an empty array when fetching all portfolios if none exist', async () => {
        const portfolios = await fetchAllData();
        expect(portfolios).toEqual([]);
    });
});