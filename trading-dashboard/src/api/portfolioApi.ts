import axios from 'axios';
import config from '../config';

export const fetchPositions = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/positions`, { headers: { 'Access-Control-Allow-Origin': '*' }});
        return response.data;
    } catch (error) {
        throw new Error('Error fetching positions');
    }
};

export const updatePosition = async (positionId: string, quantity: number) => {
    try {
        await axios.put(`${config.API_URL}/positions/${positionId}`, { quantity }, { headers: { 'Access-Control-Allow-Origin': '*' }});
    } catch (error) {
        throw new Error('Error updating position');
    }
};

export const deletePosition = async (positionId: string) => {
    try {
        await axios.delete(`${config.API_URL}/positions/${positionId}`, { headers: { 'Access-Control-Allow-Origin': '*' }});
    } catch (error) {
        throw new Error('Error deleting position');
    }
};
