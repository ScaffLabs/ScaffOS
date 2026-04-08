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

const validateInput = (input: any) => {
    if (input == null || (Array.isArray(input) && input.length === 0)) {
        throw new ValidationError('Input cannot be null or an empty array.');
    }
};

const validateQuantity = (quantity: number) => {
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new ValidationError('Quantity must be a positive number.');
    }
};

export { ServiceError, ValidationError, NotFoundError, DivisionByZeroError, OverflowError, validateInput, validateQuantity }; 