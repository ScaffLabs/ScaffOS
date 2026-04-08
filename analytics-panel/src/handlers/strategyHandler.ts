import { Request, Response } from 'express';
import { findStrategies } from '../services/strategyService';
import { ValidationError } from '../errors/customErrors';

export const getStrategiesHandler = async (req: Request, res: Response) => {
    try {
        const strategies = await findStrategies({});
        res.status(200).json(strategies.map(strategy => strategy.data.name));
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const compareStrategiesHandler = async (req: Request, res: Response) => {
    const { strategyA, strategyB } = req.query;
    try {
        if (!strategyA || !strategyB) {
            throw new ValidationError('Both strategies must be provided.');
        }
        // Validate and sanitize inputs
        const sanitizedStrategyA = validator.escape(strategyA.toString());
        const sanitizedStrategyB = validator.escape(strategyB.toString());
        // Perform comparison logic here (mocked)
        const result = { betterStrategy: Math.random() > 0.5 ? sanitizedStrategyA : sanitizedStrategyB };
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error comparing strategies:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};