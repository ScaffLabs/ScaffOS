import { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, clearPortfolios } from '../src/services/portfolioService';
import { Portfolio } from '../src/types';
import { validPortfolio, invalidPortfolio, existingPortfolioId, nonExistentPortfolioId, portfolioWithMultiplePositions } from './fixtures/portfolioFixtures';

let testPortfolio: Portfolio;

beforeEach(() => {
    clearPortfolios(); // Clear portfolios before each test
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
        const updatedPortfolio = await updatePortfolio(existingPortfolioId, { name: 'Updated Name', positions: portfolioWithMultiplePositions.positions });
        expect(updatedPortfolio.name).toBe('Updated Name');
        expect(updatedPortfolio.positions).toEqual(portfolioWithMultiplePositions.positions);
    });

    test('should throw an error when updating a non-existent portfolio', async () => {
        await expect(updatePortfolio(nonExistentPortfolioId, { name: 'Updated Name' })).rejects.toThrow('Portfolio not found');
    });

    test('should return an empty array when fetching portfolios if none exist', async () => {
        const portfolios = await fetchAllData();
        expect(portfolios).toEqual([]);
    });

    test('should return an error for invalid portfolio data during creation', async () => {
        await expect(createPortfolio({ name: null, positions: [] })).rejects.toThrow('Invalid portfolio data');
    });

    test('should update portfolio with valid positions', async () => {
        await createPortfolio(testPortfolio);
        const updatedPortfolio = await updatePortfolio(existingPortfolioId, { positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }] });
        expect(updatedPortfolio.positions.length).toBe(1);
        expect(updatedPortfolio.positions[0]).toEqual({ symbol: 'AAPL', quantity: 10, averagePrice: 150 });
    });

    test('should throw an error for invalid position update data', async () => {
        await createPortfolio(testPortfolio);
        await expect(updatePortfolio(existingPortfolioId, { positions: [{ symbol: \'\', quantity: -5, averagePrice: 150 }] })).rejects.toThrow('Invalid portfolio update data');
    });

    // Additional test for edge cases
    test('should throw an error for creating a portfolio with empty name', async () => {
        await expect(createPortfolio({ name: '', positions: [] })).rejects.toThrow('Invalid portfolio data');
    });

    test('should throw an error for creating a portfolio with negative quantity', async () => {
        await expect(createPortfolio({ name: 'Invalid Quantity', positions: [{ symbol: 'AAPL', quantity: -10, averagePrice: 150 }] })).rejects.toThrow('Invalid position data. Ensure symbol is provided and quantities are non-negative.');
    });
});