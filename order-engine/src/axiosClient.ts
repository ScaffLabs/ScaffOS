import axios from 'axios';
import { CircuitBreaker } from 'opossum';

const httpClient = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 5000,
});

const retry = async (fn: Function, retries: number = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
        }
    }
};

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

export const fetchData = async (url: string) => {
    return retry(() => circuitBreaker.fire(() => httpClient.get(url)));
};

export const postData = async (url: string, data: any) => {
    return retry(() => circuitBreaker.fire(() => httpClient.post(url, data)));
};

export const putData = async (url: string, data: any) => {
    return retry(() => circuitBreaker.fire(() => httpClient.put(url, data)));
};

export const deleteData = async (url: string) => {
    return retry(() => circuitBreaker.fire(() => httpClient.delete(url)));
};

export const healthCheck = async (url: string) => {
    try {
        const response = await fetchData(url);
        return response.status === 200;
    } catch (error) {
        console.error(`Health check failed for ${url}:`, error);
        return false;
    }
};

export const performHealthChecks = async () => {
    const services = [process.env.ANOTHER_SERVICE_URL, process.env.ORDER_SERVICE_URL];
    const results = await Promise.all(services.map(service => healthCheck(service)));
    return results.every(result => result);
};
