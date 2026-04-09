import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';

const positionStore = new InMemoryStore<Position>();

const initializeStore = () => {
    const seedPositions = positionStore.seedData();
    seedPositions.forEach(position => positionStore.create(position));
};

initializeStore();

export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const positions = Object.values(positionStore);
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching positions' });
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const position = positionStore.create(positionData);
        res.status(201).json({ message: 'Position created successfully', position });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) throw new NotFoundError('Position not found');
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        res.status(400).json({ message: error.message });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (positionStore.delete(id)) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
};