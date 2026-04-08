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

export { ServiceError, ValidationError, NotFoundError, DivisionByZeroError };