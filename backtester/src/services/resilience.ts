import axios, { AxiosError } from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

const eventEmitter = new EventEmitter();
const retryLimit = 5;
const retryDelay = 1000; // milliseconds

async function exponentialBackoff(retries: number) {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * retryDelay));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    for (let i = 0; i < retryLimit; i++) {
        try {
            return await fn();
        } catch (error) {
            logger.warn(`Retrying due to error: ${error.message}`);
            if (i === retryLimit - 1) throw error;
            await exponentialBackoff(i);
        }
    }
    throw new Error('Max retries exceeded');
}

function circuitBreaker<T>(fn: () => Promise<T>, failureThreshold: number, fallback: T): () => Promise<T> {
    let failureCount = 0;
    let isCircuitOpen = false;
    return async () => {
        if (isCircuitOpen) {
            logger.warn('Circuit breaker activated');
            return fallback;
        }
        try {
            const result = await fn();
            failureCount = 0; // Reset on success
            return result;
        } catch (error) {
            failureCount++;
            if (failureCount >= failureThreshold) {
                isCircuitOpen = true;
                logger.error('Circuit breaker opened due to failures');
                setTimeout(() => {
                    isCircuitOpen = false; // Reset the circuit after a timeout
                    logger.info('Circuit breaker reset');
                }, 30000); // 30 seconds timeout
            }
            throw error;
        }
    };
}

export { eventEmitter, withRetry, circuitBreaker };