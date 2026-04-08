// Import necessary modules
import { Request, Response } from 'express';
import { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies, initializeStore } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';

// Handler to fetch all strategies based on query parameters
export const getStrategiesHandler = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, name } = req.query;
        const query = {};
        if (name) query.name = name;
        const strategies = await findStrategies(query);
        const paginatedStrategies = strategies.slice(offset, offset + limit);
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
        // Validate input and ensure name and parameters are provided
        if (!name || !parameters) {
            throw new ValidationError('Strategy name and parameters are required.');
        }
        const newStrategy = await createStrategy({ name, parameters });
        res.status(201).json(newStrategy);
    } catch (error) {
        // Handle specific validation errors separately
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
        res.status(200).json(updatedStrategy);
    } catch (error) {
        // Handle not found errors distinctly to provide clearer feedback
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
        await deleteStrategy(id);
        res.status(204).send(); // No Content response on successful deletion
    } catch (error) {
        // Distinguish between not found and other errors
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Handler to initialize the strategy store
export const initializeHandler = async (req: Request, res: Response) => {
    try {
        await initializeStore();
        res.status(200).json({ message: 'Store initialized successfully.' });
    } catch (error) {
        console.error('Error initializing store:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
