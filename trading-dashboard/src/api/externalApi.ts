import axios from 'axios';
import { retry, circuitBreaker } from '../utils/retry';
import config from '../config';

const BASE_URL = process.env.EXTERNAL_API_URL;

const fetchData = async (endpoint: string) => {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return response.data;
};

export const fetchExternalData = circuitBreaker(retry(() => fetchData('/external-data')));

export const fetchServiceHealth = async () => {
    return await fetchData('/health');
};