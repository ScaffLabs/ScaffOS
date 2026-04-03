import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';

let portfolios: Portfolio[] = [];

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
  const newPortfolio: Portfolio = { id: String(portfolios.length + 1), ...data };  
  portfolios.push(newPortfolio);
  await publishPortfolioUpdate(newPortfolio);
  return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio | undefined> => {
  return portfolios.find(portfolio => portfolio.id === id);
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio | undefined> => {
  const portfolio = await getPortfolio(id);
  if (!portfolio) throw new Error('Portfolio not found');
  Object.assign(portfolio, data);
  await publishPortfolioUpdate(portfolio);
  return portfolio;
};