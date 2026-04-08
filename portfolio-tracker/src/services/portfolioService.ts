// Adding retry logic and circuit breaker patterns for external service calls
import axios from 'axios';
import CircuitBreaker from 'opossum';
import logger from './logger';
import env from '../config';

const circuitBreakerOptions = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
};

const portfolioServiceCircuit = new CircuitBreaker(checkExternalServiceAvailability, circuitBreakerOptions);

const checkExternalServiceAvailability = async (url: string): Promise<boolean> => {
    try {
        await portfolioServiceCircuit.fire(url);
        return true;
    } catch (error) {
        logger.error('External service not reachable', { url, error: error.message });
        return false;
    }
};

const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error;
            }
        }
    }
};