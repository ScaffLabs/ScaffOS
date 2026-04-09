// Branded types for ID

type PortfolioId = string & { readonly brand: unique symbol };

type PositionId = string & { readonly brand: unique symbol };

/**
 * Interface representing a Portfolio.
 * @property {PortfolioId} id - The unique identifier for the portfolio.
 * @property {string} name - The name of the portfolio.
 * @property {Position[]} positions - Array of positions in the portfolio.
 */
export interface Portfolio {
    id: PortfolioId;
    name: string;
    positions: Position[];
}

/**
 * Interface representing a Position in a portfolio.
 * @property {PositionId} id - The unique identifier for the position.
 * @property {string} symbol - The stock symbol of the position.
 * @property {number} quantity - The number of units held in the position.
 * @property {number} averagePrice - The average price paid for the position.
 */
export interface Position {
    id: PositionId;
    symbol: string;
    quantity: number;
    averagePrice: number;
}

/**
 * Interface representing a PortfolioUpdate.
 * @property {string} [name] - The new name of the portfolio.
 * @property {Position[]} [positions] - The new positions of the portfolio.
 */
export interface PortfolioUpdate {
    name?: string;
    positions?: Position[];
}

/**
 * Zod schema for validating Portfolio objects.
 */
export const PortfolioSchema = z.object({
    id: z.string().refine(id => id.length > 0, { message: 'ID must be a non-empty string' }),
    name: z.string().min(1, { message: 'Name is required' }),
    positions: z.array(z.object({
        id: z.string().refine(id => id.length > 0, { message: 'Position ID must be a non-empty string' }),
        symbol: z.string().min(1, { message: 'Symbol is required' }),
        quantity: z.number().nonnegative({ message: 'Quantity must be a non-negative number' }),
        averagePrice: z.number().nonnegative({ message: 'Average price must be a non-negative number' })
    })).optional()
});

/**
 * Zod schema for validating Position objects.
 */
export const PositionSchema = z.object({
    id: z.string().refine(id => id.length > 0, { message: 'Position ID must be a non-empty string' }),
    symbol: z.string().min(1, { message: 'Symbol is required' }),
    quantity: z.number().nonnegative({ message: 'Quantity must be a non-negative number' }),
    averagePrice: z.number().nonnegative({ message: 'Average price must be a non-negative number' })
});

/**
 * HealthCheckResponse interface for checking service health status.
 * @property {string} status - The health status of the service.
 * @property {boolean} portfolioService - Indicator of the portfolio service's status.
 * @property {string} [error] - Optional error message if service is down.
 */
export interface HealthCheckResponse {
    status: string;
    portfolioService: boolean;
    error?: string;
};