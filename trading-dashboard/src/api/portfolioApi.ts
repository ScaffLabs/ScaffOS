import axios from 'axios';
import config from '../config';
import { ServiceError, ValidationError } from '../utils/errors';

export const fetchPositions = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/positions`);
        if (!Array.isArray(response.data)) throw new ServiceError('Invalid data structure');
        return response.data;
    } catch (error) {
        throw new ServiceError('Error fetching positions: ' + error.message);
    }
};

export const updatePosition = async (positionId: string, quantity: number) => {
    if (typeof quantity !== 'number' || quantity <= 0) throw new ValidationError('Invalid quantity');
    try {
        await axios.put(`${config.API_URL}/positions/${positionId}`, { quantity });
    } catch (error) {
        throw new ServiceError('Error updating position: ' + error.message);
    }
};

export const deletePosition = async (positionId: string) => {
    try {
        await axios.delete(`${config.API_URL}/positions/${positionId}`);
    } catch (error) {
        throw new ServiceError('Error deleting position: ' + error.message);
    }
};

export const handleDivision = (numerator: number, denominator: number) => {
    if (denominator === 0) throw new ServiceError('Division by zero is not allowed.');
    return numerator / denominator;
};
