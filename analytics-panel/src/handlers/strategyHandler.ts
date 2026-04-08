import { Request, Response } from 'express';
import { findStrategies } from '../services/strategyService';

export const getStrategiesHandler = async (req: Request, res: Response) => {
    try {
        const strategies = await findStrategies({});
        res.status(200).json(strategies.map(strategy => strategy.data.name));
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};