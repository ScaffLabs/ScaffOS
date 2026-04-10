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

class InternalServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
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

class AppError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = 'AppError';
    }
}

export { ServiceError, ValidationError, NotFoundError, DatabaseError, InternalServerError, OverflowError, DivisionByZeroError, AppError };