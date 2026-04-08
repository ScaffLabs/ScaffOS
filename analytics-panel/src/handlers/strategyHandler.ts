import { Request, Response } from 'express';
import { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies, initializeStore } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';

export const getStrategiesHandler = async (req: Request, res: Response) => {
    const { name } = req.query;
    try {
        const strategies = await findStrategies({ name });
        res.status(200).json(strategies);
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createStrategyHandler = async (req: Request, res: Response) => {
    const { name, parameters } = req.body;
    try {
        const newStrategy = await createStrategy({ name, parameters });
        res.status(201).json(newStrategy);
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const initializeHandler = async (req: Request, res: Response) => {
    try {
        await initializeStore();
        res.status(200).json({ message: 'Store initialized successfully.' });
    } catch (error) {
        console.error('Error initializing store:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};