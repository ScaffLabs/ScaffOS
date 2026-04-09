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

class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
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

export { ServiceError, ValidationError, NotFoundError, DatabaseError, UnauthorizedError, EmptyArrayError, OverflowError, DivisionByZeroError, NullValueError }; 