import axios from 'axios';
import config from '../config';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import { Position, PositionSchema } from '../types';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const positionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

export const fetchPositions = async (limit: number = 10, offset: number = 0, sortBy: string = 'id', order: string = 'asc'): Promise<Position[]> => {
    try {
        const response = await axios.get(`${config.API_URL}/positions`, { params: { limit, offset, sortBy, order } });
        if (!Array.isArray(response.data)) throw new ServiceError('Invalid data structure');
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new NotFoundError('Positions not found');
        }
        throw new ServiceError('Error fetching positions: ' + error.message);
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const position: Position = req.body;
    const validationResult = PositionSchema.safeParse(position);
    if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid position data', errors: validationResult.error.errors });
    }
    try {
        const response = await axios.post(`${config.API_URL}/positions`, validationResult.data);
        res.status(201).json({ message: 'Position created successfully', position: response.data });
    } catch (error) {
        throw new ServiceError('Error creating position: ' + error.message);
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const positionId = req.params.id;
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    try {
        const response = await axios.put(`${config.API_URL}/positions/${positionId}`, { quantity });
        if (response.status === 204) {
            res.status(204).send();
        } else {
            throw new NotFoundError('Position not found');
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Position not found' });
        }
        throw new ServiceError('Error updating position: ' + error.message);
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const positionId = req.params.id;
    try {
        await axios.delete(`${config.API_URL}/positions/${positionId}`);
        res.status(204).send();
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Position not found' });
        }
        throw new ServiceError('Error deleting position: ' + error.message);
    }
};

export const registerRoutes = (app) => {
    app.get('/api/positions', positionRateLimiter, async (req, res) => {
        const { limit, offset, sortBy, order } = req.query;
        const positions = await fetchPositions(Number(limit), Number(offset), sortBy, order);
        res.status(200).json(positions);
    });
    app.post('/api/positions', positionRateLimiter, createPosition);
    app.put('/api/positions/:id', positionRateLimiter, updatePosition);
    app.delete('/api/positions/:id', positionRateLimiter, deletePosition);
};