import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema, validatePosition } from '../types';
import { ServiceError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { query } from '../utils/connectionPool';

const positionStore = new InMemoryStore<Position>();

/**
 * Fetches all positions based on query parameters.
 * @param req - The request object.
 * @param res - The response object.
 */
export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, sortBy = 'symbol', sortOrder = 'asc', filter = '' } = req.query;
        const sql = 'SELECT * FROM positions WHERE symbol LIKE ? ORDER BY ?? ?? LIMIT ? OFFSET ?';
        const positions = await query(sql, [`%${filter}%`, sortBy, sortOrder, Number(limit), Number(offset)]);
        res.status(200).json(positions);
    } catch (error) {
        logger.error('Error fetching positions', { error: error.message });
        res.status(500).json({ message: 'Error fetching positions' });
    }
};

/**
 * Creates a new position based on the request body.
 * @param req - The request object containing position data.
 * @param res - The response object to send back data.
 */
export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data');
        }
        const sql = 'INSERT INTO positions (id, symbol, quantity) VALUES (?, ?, ?)';
        await query(sql, [positionData.id, positionData.symbol, positionData.quantity]);
        logger.info('Position created', { positionId: positionData.id });
        res.status(201).json({ message: 'Position created successfully', position: validationResult.data });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.warn('Validation error in createPosition', { message: error.message });
            return res.status(400).json({ message: error.message });
        }
        logger.error('Error creating position', { error: error.message });
        res.status(500).json({ message: 'Error creating position' });
    }
};

/**
 * Registers the portfolio routes with the provided app.
 * @param app - The Express application.
 */
export const registerRoutes = (app: any) => {
    app.get('/api/positions', fetchPositions);
    app.post('/api/positions', createPosition);
};