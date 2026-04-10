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

export class CustomError extends Error {
    constructor(public code: number, message: string) {
        super(message);
        this.name = 'CustomError';
    }
}

export interface ErrorResponse {
    message: string;
    code?: number;
}

export type AppError = ServiceError | ValidationError | NotFoundError | OverflowError | DivisionByZeroError; 