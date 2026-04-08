import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';

const positionStore = new InMemoryStore<Position>();

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const createdPosition = positionStore.create(positionData);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: 'Invalid position data', errors: error.message });
        }
        throw new ServiceError('Error creating position: ' + error.message);
    }
};

export const fetchPositions = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, sort = 'id', order = 'asc' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);
    const parsedOrder = order === 'desc' ? 'desc' : 'asc';

    if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit < 1) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const positions = Object.values(positionStore.data)
        .sort((a, b) => parsedOrder === 'asc' ? a[sort] > b[sort] ? 1 : -1 : a[sort] < b[sort] ? 1 : -1)
        .slice(parsedOffset, parsedOffset + parsedLimit);

    res.status(200).json(positions);
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid input data' });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const isDeleted = positionStore.delete(id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting position' });
    }
};

export const registerRoutes = (app: any) => {
    app.post('/api/positions', createPosition);
    app.get('/api/positions', fetchPositions);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};