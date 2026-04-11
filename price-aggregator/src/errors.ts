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

class InvalidTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTypeError';
    }
}

class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export { ServiceError, ValidationError, NotFoundError, OverflowError, DivisionByZeroError, NullValueError, InvalidTypeError, UnauthorizedError };