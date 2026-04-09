import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError, ValidationError } from '../utils/errors';
import rateLimit from 'express-rate-limit';

const positionStore = new InMemoryStore<Position>();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        if (isNaN(Number(limit)) || isNaN(Number(offset))) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }
        let positions = Object.values(positionStore.data);
        const paginatedPositions = positions.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedPositions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching positions' });
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const createdPosition = positionStore.create(positionData);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
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
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
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
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
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