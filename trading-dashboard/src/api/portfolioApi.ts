import axios from 'axios';
import config from '../config';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import { Position, PositionSchema } from '../types';

export const fetchPositions = async (limit: number, offset: number, sortBy: string, order: string): Promise<Position[]> => {
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

export const createPosition = async (position: Position) => {
    const validationResult = PositionSchema.safeParse(position);
    if (!validationResult.success) {
        throw new ValidationError('Invalid position data');
    }
    try {
        await axios.post(`${config.API_URL}/positions`, validationResult.data);
    } catch (error) {
        throw new ServiceError('Error creating position: ' + error.message);
    }
};

export const updatePosition = async (positionId: Position['id'], quantity: number) => {
    validateQuantity(quantity);
    try {
        const positionUpdate = { id: positionId, quantity };
        const validationResult = PositionSchema.safeParse(positionUpdate);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data');
        }
        await axios.put(`${config.API_URL}/positions/${positionId}`, { quantity });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new NotFoundError('Position not found');
        }
        throw new ServiceError('Error updating position: ' + error.message);
    }
};

export const deletePosition = async (positionId: Position['id']) => {
    try {
        await axios.delete(`${config.API_URL}/positions/${positionId}`);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new NotFoundError('Position not found');
        }
        throw new ServiceError('Error deleting position: ' + error.message);
    }
};