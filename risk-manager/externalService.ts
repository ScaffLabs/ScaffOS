import axios from 'axios';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';

const circuitBreaker = new DrawdownCircuitBreaker(20);

const exponentialBackoff = (retryCount: number) => {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
};

export const fetchWithRetry = async (url: string, retries: number = 5): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (circuitBreaker.isActive) {
                throw new Error('Circuit breaker is active, skipping request');
            }
            if (i === retries - 1) throw error;
            console.log(`Retrying... (${i + 1})`);
            await exponentialBackoff(i);
        }
    }
};
