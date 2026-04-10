import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import { query } from '../utils/connectionPool';
import { fetchExternalData } from './externalApi';

const positionStore = new InMemoryStore<Position>();

export const fetchPositions = async (req: Request, res: Response) => {
    const { limit, offset } = req.query;
    const parsedLimit = parseInt(limit as string) || 10;
    const parsedOffset = parseInt(offset as string) || 0;
    try {
        const sql = 'SELECT * FROM positions LIMIT ? OFFSET ?';
        const positions = await query(sql, [parsedLimit, parsedOffset]);
        res.status(200).json(positions);
    } catch (error) {
        logger.error('Error fetching positions', { error: error.message });
        res.status(500).json({ message: 'Error fetching positions: ' + error.message });
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        const sql = 'INSERT INTO positions (id, symbol, quantity) VALUES (?, ?, ?)';
        await query(sql, [positionData.id, positionData.symbol, positionData.quantity]);
        logger.info('Position created', { positionId: positionData.id });
        res.status(201).json({ message: 'Position created successfully', position: validationResult.data });
    } catch (error) {
        logger.error('Error creating position', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating position: ' + error.message });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        const existingPosition = await positionStore.read(id);
        if (!existingPosition) {
            throw new NotFoundError('Position not found.');
        }
        const sql = 'UPDATE positions SET symbol = ?, quantity = ? WHERE id = ?';
        await query(sql, [positionData.symbol, positionData.quantity, id]);
        logger.info('Position updated', { positionId: id });
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating position', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating position: ' + error.message });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const existingPosition = await positionStore.read(id);
        if (!existingPosition) {
            throw new NotFoundError('Position not found.');
        }
        const sql = 'DELETE FROM positions WHERE id = ?';
        await query(sql, [id]);
        logger.info('Position deleted', { positionId: id });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting position', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error deleting position: ' + error.message });
    }
};

export const registerRoutes = (app: any) => {
    app.get('/api/positions', fetchPositions);
    app.post('/api/positions', createPosition);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};