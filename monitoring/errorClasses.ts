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

class InvalidTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTypeError';
    }
}

class NullValueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NullValueError';
    }
}

class UnexpectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnexpectedError';
    }
}

export { ServiceError, ValidationError, NotFoundError, OverflowError, DivisionByZeroError, InvalidTypeError, NullValueError, UnexpectedError };