import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';
import { initializeStore } from '../storage/migrations';
import validator from 'validator';

const positionStore = new InMemoryStore<Position>();
initializeStore(positionStore);

export const fetchPositions = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, sort } = req.query;
    if (isNaN(Number(limit)) || isNaN(Number(offset))) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    let positions = Object.values(positionStore.data);

    const { symbol } = req.query;
    if (symbol) {
        positions = positions.filter(position => position.symbol === symbol);
    }

    if (sort) {
        const [orderBy, order] = sort.startsWith('-') ? [sort.slice(1), 'desc'] : [sort, 'asc'];
        positions.sort((a, b) => {
            if (order === 'asc') return a[orderBy] > b[orderBy] ? 1 : -1;
            return a[orderBy] < b[orderBy] ? 1 : -1;
        });
    }

    const paginatedPositions = positions.slice(Number(offset), Number(offset) + Number(limit));
    res.status(200).json(paginatedPositions);
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        if (!validator.isUUID(positionData.id)) {
            throw new ServiceError('Invalid position ID');
        }
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
        if (!validator.isUUID(id)) {
            return res.status(400).json({ message: 'Invalid position ID' });
        }
        validatePosition(positionData);
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.message });
        }
        return res.status(500).json({ message: 'Error updating position' });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (!validator.isUUID(id)) {
            return res.status(400).json({ message: 'Invalid position ID' });
        }
        const isDeleted = positionStore.delete(id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting position' });
    }
};
