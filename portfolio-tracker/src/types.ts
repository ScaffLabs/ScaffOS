// Branded types for portfolio and position IDs
import { z } from 'zod';

export type PortfolioId = string & { readonly brand: unique symbol };
export type PositionId = string & { readonly brand: unique symbol };

/**
 * Portfolio interface representing a user's investment portfolio.
 * @property {PortfolioId} id - Unique identifier for the portfolio.
 * @property {string} name - Name of the portfolio.
 * @property {Position[]} positions - Array of positions in the portfolio.
 */
export interface Portfolio {
    id: PortfolioId;
    name: string;
    positions: Position[];
}

/**
 * Position interface representing a stock position within a portfolio.
 * @property {PositionId} id - Unique identifier for the position.
 * @property {string} symbol - Stock symbol for the position.
 * @property {number} quantity - Number of shares held.
 * @property {number} averagePrice - Average purchase price per share.
 */
export interface Position {
    id: PositionId;
    symbol: string;
    quantity: number;
    averagePrice: number;
}

/**
 * PortfolioUpdate interface for updating portfolio details.
 * @property {string} [name] - Optional new name for the portfolio.
 * @property {Position[]} [positions] - Optional array of positions to update.
 */
export interface PortfolioUpdate {
    name?: string;
    positions?: Position[];
}

// Zod schemas for runtime validation
export const PositionSchema = z.object({
    id: z.string().refine(id => id.length > 0, { message: 'Position ID must be a non-empty string' }),
    symbol: z.string().min(1, { message: 'Symbol is required' }),
    quantity: z.number().nonnegative({ message: 'Quantity must be a non-negative number' }),
    averagePrice: z.number().nonnegative({ message: 'Average price must be a non-negative number' }),
});

export const PortfolioSchema = z.object({
    id: z.string().refine(id => id.length > 0, { message: 'ID must be a non-empty string' }),
    name: z.string().min(1, { message: 'Name is required' }),
    positions: z.array(PositionSchema).optional().nonempty({ message: 'Positions must not be empty' }),
});

/**
 * Function to validate portfolio data against the schema.
 * @param data - The portfolio data to validate.
 * @returns {boolean} - Whether the data is valid or not.
 */
export const validatePortfolioData = (data: any): data is Portfolio => {
    const validationResult = PortfolioSchema.safeParse(data);
    if (!validationResult.success) {
        throw new Error(validationResult.error.errors.map(e => e.message).join(', '));
    }
    return true;
};