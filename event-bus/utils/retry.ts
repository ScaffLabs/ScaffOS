import axios from 'axios';

export const axiosServiceWithRetry = async (url, retries = 3, backoff = 300) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response;
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                backoff *= 2; // Exponential backoff
            } else {
                throw error;
            }
        }
    }
};

export const circuitBreaker = (fn, threshold = 5, timeout = 5000) => {
    let failureCount = 0;
    let lastFailureTime = 0;

    return async (...args) => {
        const now = Date.now();
        if (failureCount >= threshold && (now - lastFailureTime) < timeout) {
            throw new Error('Circuit is open');
        }
        try {
            const result = await fn(...args);
            failureCount = 0; // Reset on success
            return result;
        } catch (error) {
            lastFailureTime = now;
            failureCount++;
            throw error;
        }
    };
};