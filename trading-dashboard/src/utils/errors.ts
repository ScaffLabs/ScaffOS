class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

class DivisionByZeroError extends Error {
    constructor() {
        super('Division by zero is not allowed.');
        this.name = 'DivisionByZeroError';
    }
}

class OverflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OverflowError';
    }
}

class CustomError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'CustomError';
    }
}

class InvalidInputError extends ValidationError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

class DatabaseConnectionError extends ServiceError {
    constructor() {
        super('Failed to connect to the database.');
        this.name = 'DatabaseConnectionError';
    }
}

class InputValidationError extends ValidationError {
    constructor(field: string) {
        super(`Invalid input for field: ${field}`);
        this.name = 'InputValidationError';
    }
}

export { ServiceError, ValidationError, NotFoundError, DivisionByZeroError, OverflowError, CustomError, InvalidInputError, DatabaseConnectionError, InputValidationError };