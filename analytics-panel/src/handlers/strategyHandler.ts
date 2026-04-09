// Import necessary modules
import { Request, Response } from 'express';
import { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';

// Handler to fetch all strategies based on query parameters
export const getStrategiesHandler = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, name } = req.query;
        const query: any = {};
        if (name) query.name = new RegExp(name, 'i'); // Case-insensitive search
        const strategies = await findStrategies(query);
        // Paginate strategies based on limit and offset parameters
        const paginatedStrategies = strategies.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedStrategies);
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Handler to create a new strategy
export const createStrategyHandler = async (req: Request, res: Response) => {
    const { name, parameters } = req.body;
    try {
        if (!name || !parameters) {
            throw new ValidationError('Strategy name and parameters are required.');
        }
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

// Handler to update an existing strategy
export const updateStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parameters } = req.body;
    try {
        const updatedStrategy = await updateStrategy(id, { name, parameters });
        if (!updatedStrategy) {
            throw new NotFoundError('Strategy not found.');
        }
        res.status(200).json(updatedStrategy);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error updating strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Handler to delete a strategy by its ID
export const deleteStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await deleteStrategy(id);
        if (!deleted) {
            throw new NotFoundError('Strategy not found.');
        }
        res.status(204).send(); // No content to return on successful deletion
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};