import { Request, Response } from 'express';
import { findStrategies, createStrategy, updateStrategy, deleteStrategy } from '../services/strategyService';
import { ValidationError, NotFoundError } from '../errors/customErrors';
import logger from '../logger';

export const getStrategiesHandler = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, name } = req.query;
    try {
        const query = {};
        if (name) query.name = name;
        const strategies = await findStrategies(query);
        const paginatedStrategies = strategies.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedStrategies);
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

export const updateStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parameters } = req.body;
    try {
        const updatedStrategy = await updateStrategy(id, { name, parameters });
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

export const deleteStrategyHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await deleteStrategy(id);
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