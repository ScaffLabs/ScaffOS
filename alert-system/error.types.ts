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
export type AppError = ServiceError | ValidationError | NotFoundError;