import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.BASE_URL || 'https://api.example.com';
const MAX_RETRIES = 3;

export const httpClient = async (path: string, config?: AxiosRequestConfig) => {
    const url = `${BASE_URL}${path}`;
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await axios.get(url, config);
            return response.data;
        } catch (error) {
            lastError = error;
            console.error(`Request failed (attempt ${attempt + 1}):`, error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // backoff
        }
    }

    throw new Error(`Request failed after ${MAX_RETRIES} attempts: ${lastError}`);
};
