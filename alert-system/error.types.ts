export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class OverflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OverflowError';
    }
}

export class DivisionByZeroError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DivisionByZeroError';
    }
}

/**
 * Interface for error response structure.
 */
export interface ErrorResponse {
    message: string;
    code?: number;
}

/**
 * Types for common application errors.
 */
export type AppError = ServiceError | ValidationError | NotFoundError | OverflowError | DivisionByZeroError; 

/**
 * Represents a custom error with additional details.
 * @property {string} message - The error message.
 * @property {string} type - The type of error.
 * @property {number} [code] - Optional error code.
 */
export interface CustomError extends ErrorResponse {
    type: 'CustomError';
} 

/**
 * Creates a custom error.
 * @param message - The error message.
 * @param code - Optional error code.
 * @returns {CustomError} - The created custom error.
 */
export const createCustomError = (message: string, code?: number): CustomError => {
    return { message, code, type: 'CustomError' };
};