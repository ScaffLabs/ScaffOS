import axios, { AxiosError } from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { BacktestEventSchema } from '../types';

const eventEmitter = new EventEmitter();
const retryLimit = 5;
const retryDelay = 1000; // milliseconds
const circuitBreakTimeout = 30000; // 30 seconds
const TIMEOUT = 5000; // 5 seconds timeout for async operations

async function exponentialBackoff(retries: number) {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * retryDelay));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    for (let i = 0; i < retryLimit; i++) {
        try {
            return await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), TIMEOUT))
            ]);
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
    let nextReset = Date.now();

    return async () => {
        if (isCircuitOpen) {
            if (Date.now() < nextReset) {
                logger.warn('Circuit breaker activated');
                return fallback;
            } else {
                isCircuitOpen = false;
                failureCount = 0;
                logger.info('Circuit breaker reset');
            }
        }
        try {
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), TIMEOUT))
            ]);
            failureCount = 0;
            return result;
        } catch (error) {
            failureCount++;
            if (failureCount >= failureThreshold) {
                isCircuitOpen = true;
                nextReset = Date.now() + circuitBreakTimeout;
                logger.error('Circuit breaker opened due to failures');
            }
            throw error;
        }
    };
}

function emitBacktestEvent(event: unknown) {
    const validation = BacktestEventSchema.safeParse(event);
    if (!validation.success) {
        logger.error('Invalid event data:', validation.error.format());
        return;
    }
    eventEmitter.emit(event.type, validation.data);
}

export { eventEmitter, withRetry, circuitBreaker, emitBacktestEvent };