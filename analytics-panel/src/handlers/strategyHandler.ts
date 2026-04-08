// Import necessary modules and types
import { Request, Response } from 'express';
import { findStrategies, createStrategy, updateStrategy, deleteStrategy } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';
import logger from '../logger';

// Handler to get strategies with pagination and filtering
export const getStrategiesHandler = async (req: Request, res: Response) => {
    // Extract query parameters for pagination and filtering
    const { limit = 10, offset = 0, name } = req.query;
    try {
        // Build query based on optional name parameter
        const query = name ? { name: name.toString() } : {};
        const strategies = await findStrategies(query);
        // Paginate results according to limit and offset
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
        // Validate that name and parameters are provided
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