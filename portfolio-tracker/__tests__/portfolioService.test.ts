import { createPortfolio, getPortfolio, updatePortfolio } from '../src/services/portfolioService';
import { Portfolio } from '../src/types';

let testPortfolio: Portfolio;

describe('Portfolio Service', () => {
  beforeEach(() => {
    testPortfolio = { id: '1', name: 'Test Portfolio', positions: [] };
  });

  test('should create a portfolio', async () => {
    const portfolio = await createPortfolio({ name: 'New Portfolio', positions: [] });
    expect(portfolio).toHaveProperty('id');
    expect(portfolio.name).toBe('New Portfolio');
  });

  test('should get a portfolio by id', async () => {
    await createPortfolio({ name: 'Portfolio to Get', positions: [] });
    const portfolio = await getPortfolio('1');
    expect(portfolio).toEqual(testPortfolio);
  });

  test('should throw an error when getting a non-existent portfolio', async () => {
    await expect(getPortfolio('999')).resolves.toBeUndefined();
  });

  test('should update a portfolio', async () => {
    await createPortfolio({ name: 'Portfolio to Update', positions: [] });
    const updatedPortfolio = await updatePortfolio('1', { name: 'Updated Name' });
    expect(updatedPortfolio.name).toBe('Updated Name');
  });

  test('should throw an error when updating a non-existent portfolio', async () => {
    await expect(updatePortfolio('999', { name: 'Updated Name' })).rejects.toThrow('Portfolio not found');
  });
});
