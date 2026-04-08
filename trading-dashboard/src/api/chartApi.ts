import axios from 'axios';
import config from '../config';
import { ServiceError } from '../utils/errors';

export const fetchChartData = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/chart-data`);
        if (!Array.isArray(response.data)) throw new ServiceError('Invalid data structure');
        return response.data;
    } catch (error) {
        throw new ServiceError('Error fetching chart data: ' + error.message);
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