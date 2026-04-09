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

export { ServiceError, ValidationError, NotFoundError, EmptyArrayError, OverflowError, DivisionByZeroError, NullValueError }; 