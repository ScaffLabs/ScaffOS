export const validPortfolio = { name: 'Valid Portfolio', positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }] };
export const invalidPortfolio = { name: '', positions: [] };
export const existingPortfolioId = '1';
export const nonExistentPortfolioId = '999';
export const portfolioWithMultiplePositions = { name: 'Diverse Portfolio', positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }, { symbol: 'GOOGL', quantity: 5, averagePrice: 2000 }] };