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
    resetTimeout: 30000
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
