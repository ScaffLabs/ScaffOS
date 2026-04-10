import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError } from '../utils/errors';
import logger from '../utils/logger';
import { query } from '../utils/connectionPool';

const positionStore = new InMemoryStore<Position>();

export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT * FROM positions';
        const positions = await query(sql, []);
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
            throw new ServiceError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        const sql = 'INSERT INTO positions (id, symbol, quantity) VALUES (?, ?, ?)';
        await query(sql, [positionData.id, positionData.symbol, positionData.quantity]);
        logger.info('Position created', { positionId: positionData.id });
        res.status(201).json({ message: 'Position created successfully', position: validationResult.data });
    } catch (error) {
        logger.error('Error creating position', { error: error.message });
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating position: ' + error.message });
    }
};

export const registerRoutes = (app: any) => {
    app.get('/api/positions', fetchPositions);
    app.post('/api/positions', createPosition);
};