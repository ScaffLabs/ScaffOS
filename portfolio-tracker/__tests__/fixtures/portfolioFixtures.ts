export const validPortfolio = { name: 'Valid Portfolio', positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }] };
export const invalidPortfolio = { name: '', positions: [] };
export const existingPortfolioId = '1';
export const nonExistentPortfolioId = '999';
export const portfolioWithMultiplePositions = { name: 'Diverse Portfolio', positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }, { symbol: 'GOOGL', quantity: 5, averagePrice: 2000 }] };
export const portfolioWithNegativeQuantity = { name: 'Negative Quantity Portfolio', positions: [{ symbol: 'AAPL', quantity: -5, averagePrice: 150 }] };
export const portfolioWithEmptySymbol = { name: 'Empty Symbol Portfolio', positions: [{ symbol: '', quantity: 10, averagePrice: 150 }] };
export const portfolioWithZeroQuantity = { name: 'Zero Quantity Portfolio', positions: [{ symbol: 'AAPL', quantity: 0, averagePrice: 150 }] };
