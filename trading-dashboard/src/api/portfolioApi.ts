import axios from 'axios';
import config from '../config';
import { ServiceError, ValidationError } from '../utils/errors';
import { Position, PositionSchema } from '../types';

export const fetchPositions = async (): Promise<Position[]> => {
    try {
        const response = await axios.get(`${config.API_URL}/positions`);
        if (!Array.isArray(response.data)) throw new ServiceError('Invalid data structure');
        return response.data;
    } catch (error) {
        throw new ServiceError('Error fetching positions: ' + error.message);
    }
};

export const updatePosition = async (positionId: Position['id'], quantity: number) => {
    if (typeof quantity !== 'number' || quantity <= 0) throw new ValidationError('Invalid quantity');
    try {
        const positionUpdate = { id: positionId, quantity };
        const validationResult = PositionSchema.safeParse(positionUpdate);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data');
        }
        await axios.put(`${config.API_URL}/positions/${positionId}`, { quantity });
    } catch (error) {
        throw new ServiceError('Error updating position: ' + error.message);
    }
};

export const deletePosition = async (positionId: Position['id']) => {
    try {
        await axios.delete(`${config.API_URL}/positions/${positionId}`);
    } catch (error) {
        throw new ServiceError('Error deleting position: ' + error.message);
    }
};