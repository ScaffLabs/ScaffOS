import { Request, Response } from 'express';
import { createStrategy, updateStrategy, deleteStrategy, findStrategies } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';

// Handler to fetch all strategies with pagination
export const getStrategiesHandler = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        // Fetch all strategies from the service layer
        const strategies = await findStrategies({});
        // Paginate the strategies based on the limit and offset provided in the query
        const paginatedStrategies = strategies.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedStrategies);
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Failed to fetch strategies.' });
    }
};

// Handler to create a new strategy
export const createStrategyHandler = async (req: Request, res: Response) => {
    const { name, parameters } = req.body;
    try {
        // Validate input data for strategy creation
        if (!name || !parameters) {
            throw new ValidationError('Strategy name and parameters are required.');
        }
        // Create the new strategy through the service layer
        const newStrategy = await createStrategy({ name, parameters });
        res.status(201).json(newStrategy);
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating strategy:', error);
            res.status(500).json({ error: 'Failed to create strategy.' });
        }
    }
};

// Handler to update an existing strategy
export const updateStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parameters } = req.body;
    try {
        // Update strategy by ID and return the updated strategy
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
            res.status(500).json({ error: 'Failed to update strategy.' });
        }
    }
};

// Handler to delete a strategy by its ID
export const deleteStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Delete strategy by ID and return a 204 status if successful
        const deleted = await deleteStrategy(id);
        if (!deleted) {
            throw new NotFoundError('Strategy not found.');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting strategy:', error);
            res.status(500).json({ error: 'Failed to delete strategy.' });
        }
    }
};