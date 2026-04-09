import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError, ValidationError } from '../utils/errors';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import logger from '../utils/logger';

const positionStore = new InMemoryStore<Position>();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = '10', offset = '0' } = req.query;
        const limitNumber = parseInt(limit as string);
        const offsetNumber = parseInt(offset as string);

        if (isNaN(limitNumber) || isNaN(offsetNumber) || limitNumber < 1 || offsetNumber < 0) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

        let positions = Object.values(positionStore.data);
        const paginatedPositions = positions.slice(offsetNumber, offsetNumber + limitNumber);
        res.status(200).json(paginatedPositions);
    } catch (error) {
        logger.error('Error fetching positions', { error: error.message });
        res.status(500).json({ message: 'Error fetching positions' });
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const createdPosition = positionStore.create(positionData);
        logger.info('Position created', { positionId: createdPosition.id });
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.warn('Validation error in createPosition', { message: error.message });
            return res.status(400).json({ message: error.message });
        }
        logger.error('Error creating position', { error: error.message });
        res.status(500).json({ message: 'Error creating position' });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) {
            throw new NotFoundError('Position not found');
        }
        logger.info('Position updated', { positionId: id });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn('Position not found', { positionId: id });
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            logger.warn('Validation error in updatePosition', { message: error.message });
            return res.status(400).json({ message: error.message });
        }
        logger.error('Error updating position', { error: error.message });
        res.status(500).json({ message: 'Error updating position' });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = positionStore.delete(id);
        if (!deleted) {
            throw new NotFoundError('Position not found');
        }
        logger.info('Position deleted', { positionId: id });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn('Position not found', { positionId: id });
            return res.status(404).json({ message: error.message });
        }
        logger.error('Error deleting position', { error: error.message });
        res.status(500).json({ message: 'Error deleting position' });
    }
};

export const registerRoutes = (app: any) => {
    app.use('/api/positions', limiter);
    app.get('/', fetchPositions);
    app.post('/', createPosition);
    app.put('/:id', updatePosition);
    app.delete('/:id', deletePosition);
};