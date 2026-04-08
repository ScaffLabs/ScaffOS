import axios from 'axios';
import { ServiceError } from '../errors/customErrors';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const axiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 5000 });

const fetchWithRetry = async (url, config, retries = 0) => {
    try {
        const response = await axiosInstance.get(url, config);
        return response.data;
    } catch (error) {
        if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            return fetchWithRetry(url, config, retries + 1);
        }
        throw new ServiceError('Failed to fetch data: ' + error.message);
    }
};

export const fetchPerformanceMetrics = async () => {
    return await fetchWithRetry('/api/performance');
};

export const fetchComparisonData = async (strategyA, strategyB) => {
    return await fetchWithRetry('/api/compare', { params: { strategyA, strategyB }});
};