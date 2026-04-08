// Import necessary modules and types
import { Request, Response } from 'express';
import { findStrategies, createStrategy, updateStrategy, deleteStrategy } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';
import logger from '../logger';

// Handler to get strategies with pagination and filtering
export const getStrategiesHandler = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, name } = req.query;
    try {
        const query = name ? { name: name.toString() } : {};
        const strategies = await findStrategies(query);
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
            throw new ValidationError('Name and parameters are required.');
        }
        const newStrategy = await createStrategy({ name, parameters });
        logger.logRequest('POST', '/api/strategies', 201, 0);
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

// Handler to update a strategy
export const updateStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parameters } = req.body;
    try {
        const strategy = await updateStrategy(id, { name, parameters });
        if (!strategy) {
            throw new NotFoundError('Strategy not found.');
        }
        res.status(200).json(strategy);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error updating strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Handler to delete a strategy
export const deleteStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const success = await deleteStrategy(id);
        if (!success) {
            throw new NotFoundError('Strategy not found.');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
