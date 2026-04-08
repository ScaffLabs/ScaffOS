import axios from 'axios';
import config from '../config';

const BASE_URL = config.API_URL;

export const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        return response.data;
    } catch (error) {
        console.error('Error fetching health status:', error);
        throw error;
    }
};

export const postConfiguration = async (key: string, value: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/config`, { key, value });
        return response.data;
    } catch (error) {
        console.error('Error posting configuration:', error);
        throw error;
    }
};
