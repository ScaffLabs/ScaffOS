import { z } from 'zod';
import { Portfolio } from './types';

// Event types for portfolio updates
export type PortfolioUpdatedEvent = {
    type: 'portfolioUpdated';
    payload: Portfolio;
};

export type PortfolioEvent = PortfolioUpdatedEvent;

// Zod schema for event validation
export const PortfolioUpdatedEventSchema = z.object({
    type: z.literal('portfolioUpdated'),
    payload: z.object({
        id: z.string().refine(id => id.length > 0, { message: 'Portfolio ID is required' }),
        name: z.string().min(1, { message: 'Portfolio name is required' }),
        positions: z.array(z.object({
            symbol: z.string().min(1, { message: 'Symbol is required' }),
            quantity: z.number().nonnegative({ message: 'Quantity must be a non-negative number' }),
            averagePrice: z.number().nonnegative({ message: 'Average price must be a non-negative number' }),
        })).optional().nonempty({ message: 'Positions must not be empty' }),
    }),
});

/**
 * Function to validate portfolio events.
 * @param event - The event to validate.
 * @returns {boolean} - Whether the event is valid or not.
 */
export const validatePortfolioEvent = (event: PortfolioEvent) => {
    return PortfolioUpdatedEventSchema.safeParse(event).success;
};
