import { Portfolio, PortfolioUpdate } from '../types';
import { publishPortfolioUpdate } from '../eventBus';

let portfolios: Portfolio[] = [];

/**
 * Creates a new portfolio and publishes an update event.
 * This function constructs a new portfolio object, assigns a unique ID,
 * pushes it to the portfolios array, and then notifies any subscribers
 * of the event.
 */
export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
  const newPortfolio: Portfolio = { id: String(portfolios.length + 1), ...data };  // Assigns a unique ID based on the current length
  portfolios.push(newPortfolio); // Adds the new portfolio to the in-memory array
  await publishPortfolioUpdate(newPortfolio); // Notifies subscribers of the new portfolio
  return newPortfolio; // Returns the newly created portfolio
};

/**
 * Retrieves a portfolio by its ID.
 * This function searches the portfolios array for a matching ID
 * and returns the portfolio if found, or undefined if not.
 */
export const getPortfolio = async (id: string): Promise<Portfolio | undefined> => {
  return portfolios.find(portfolio => portfolio.id === id); // Searches for the portfolio by ID
};

/**
 * Updates an existing portfolio.
 * Throws an error if the portfolio is not found.
 * After updating, it publishes an event to notify subscribers.
 */
export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio | undefined> => {
  const portfolio = await getPortfolio(id);
  if (!portfolio) throw new Error('Portfolio not found'); // Error handling if portfolio is not found
  Object.assign(portfolio, data); // Updates the portfolio properties with new data
  await publishPortfolioUpdate(portfolio); // Notifies subscribers of the updated portfolio
  return portfolio; // Returns the updated portfolio
};