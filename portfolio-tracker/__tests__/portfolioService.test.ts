import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios, clearPortfolios } from '../src/services/portfolioService';
import { Portfolio } from '../src/types';

let testPortfolio: Portfolio;

beforeEach(() => {
    clearPortfolios(); // Clear portfolios before each test
    testPortfolio = { id: '1', name: 'Test Portfolio', positions: [] };
});

describe('Portfolio Service', () => {
    test('should create a portfolio', async () => {
        const portfolio = await createPortfolio({ name: 'New Portfolio', positions: [] });
        expect(portfolio).toHaveProperty('id');
        expect(portfolio.name).toBe('New Portfolio');
    });

    test('should get a portfolio by id', async () => {
        await createPortfolio(testPortfolio);
        const portfolio = await getPortfolio('1');
        expect(portfolio).toEqual(testPortfolio);
    });

    test('should throw an error when getting a non-existent portfolio', async () => {
        await expect(getPortfolio('999')).rejects.toThrow('Portfolio not found');
    });

    test('should update a portfolio', async () => {
        await createPortfolio(testPortfolio);
        const updatedPortfolio = await updatePortfolio('1', { name: 'Updated Name' });
        expect(updatedPortfolio.name).toBe('Updated Name');
    });

    test('should throw an error when updating a non-existent portfolio', async () => {
        await expect(updatePortfolio('999', { name: 'Updated Name' })).rejects.toThrow('Portfolio not found');
    });

    test('should throw an error on creating portfolio with invalid data', async () => {
        await expect(createPortfolio({ name: '', positions: [] })).rejects.toThrow('Invalid portfolio data');
    });

    test('should return an empty array when fetching portfolios if none exist', async () => {
        const portfolios = await fetchPortfolios();
        expect(portfolios).toEqual([]);
    });

    test('should return an error for invalid portfolio data during creation', async () => {
        await expect(createPortfolio({ name: null, positions: [] })).rejects.toThrow('Invalid portfolio data');
    });

    test('should update portfolio with valid positions', async () => {
        await createPortfolio(testPortfolio);
        const updatedPortfolio = await updatePortfolio('1', { positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }] });
        expect(updatedPortfolio.positions.length).toBe(1);
        expect(updatedPortfolio.positions[0]).toEqual({ symbol: 'AAPL', quantity: 10, averagePrice: 150 });
    });
});