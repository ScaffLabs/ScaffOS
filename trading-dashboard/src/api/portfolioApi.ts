import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';
import { initializeStore } from '../storage/migrations';

const positionStore = new InMemoryStore<Position>();
initializeStore(positionStore);

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
        throw new ServiceError('Error fetching positions: ' + error.message);
    }
};

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
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.message });
        }
        return res.status(500).json({ message: 'Error updating position' });
    }
};