import axios from 'axios';
import config from '../config';
import { ServiceError } from '../utils/errors';

export const fetchChartData = async () => {
    try {
        const response = await axios.get(`${config.externalApiUrl}/chart`);
        validateChartData(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw new ServiceError('Failed to fetch chart data: ' + error.message);
    }
};

export const validateChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new ServiceError('Chart data cannot be empty or invalid');
    }
    data.forEach(item => {
        if (typeof item.date !== 'string' || typeof item.price !== 'number') {
            throw new ServiceError('Invalid data item');
        }
    });
};

export const addChartData = async (date: string, price: number) => {
    if (typeof date !== 'string' || typeof price !== 'number') {
        throw new ServiceError('Invalid input for chart data');
    }
    try {
        await axios.post(`${config.externalApiUrl}/chart`, { date, price });
    } catch (error) {
        console.error('Error adding chart data:', error);
        throw new ServiceError('Error adding chart data: ' + error.message);
    }
};