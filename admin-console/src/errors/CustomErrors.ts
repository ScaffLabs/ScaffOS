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

class EmptyArrayError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmptyArrayError';
    }
}

class OverflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OverflowError';
    }
}

class DivisionByZeroError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DivisionByZeroError';
    }
}

class NullValueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NullValueError';
    }
}

class InvalidInputTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputTypeError';
    }
}

class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
    }
    // Additional properties can be added as needed
}

export { ServiceError, ValidationError, NotFoundError, EmptyArrayError, OverflowError, DivisionByZeroError, NullValueError, InvalidInputTypeError, CustomError };