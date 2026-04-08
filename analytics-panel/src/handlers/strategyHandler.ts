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
/**
 * @swagger
 * /api/strategies:
 *   post:
 *     summary: Create a new strategy
 *     description: Creates a new strategy with specified parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input
 */
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

// Handler to update an existing strategy
/**
 * @swagger
 * /api/strategies/{id}:
 *   put:
 *     summary: Update a strategy
 *     description: Updates the strategy with the specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the strategy to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Successfully updated
 *       404:
 *         description: Strategy not found
 *       400:
 *         description: Invalid input
 */
export const updateStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parameters } = req.body;
    try {
        if (!name || !parameters) {
            throw new ValidationError('Name and parameters are required.');
        }
        const updatedStrategy = await updateStrategy(id, { name, parameters });
        if (!updatedStrategy) {
            throw new NotFoundError('Strategy not found.');
        }
        logger.logRequest('PUT', `/api/strategies/${id}`, 200, 0);
        res.status(200).json(updatedStrategy);
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error updating strategy:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Handler to delete a strategy
/**
 * @swagger
 * /api/strategies/{id}:
 *   delete:
 *     summary: Delete a strategy
 *     description: Deletes the strategy with the specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the strategy to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Strategy not found
 */
export const deleteStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await deleteStrategy(id);
        if (!deleted) {
            throw new NotFoundError('Strategy not found.');
        }
        logger.logRequest('DELETE', `/api/strategies/${id}`, 204, 0);
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