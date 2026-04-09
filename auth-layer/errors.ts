class ServiceError extends Error { constructor(message: string) { super(message); this.name = 'ServiceError'; } }
class ValidationError extends Error { constructor(errors: string[]) { super('Validation error'); this.errors = errors; this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }
class InternalServerError extends Error { constructor(message: string) { super(message); this.name = 'InternalServerError'; } }
class ValidationOverflowError extends Error { constructor(message: string) { super(message); this.name = 'ValidationOverflowError'; } }
class DivisionByZeroError extends Error { constructor(message: string) { super(message); this.name = 'DivisionByZeroError'; } }

const createError = (type: string, message: string) => {
    switch (type) {
        case 'ValidationError': return new ValidationError([message]);
        case 'NotFoundError': return new NotFoundError(message);
        case 'ServiceError': return new ServiceError(message);
        default: return new InternalServerError('An unexpected error occurred.');
    }
};

export { ServiceError, ValidationError, NotFoundError, InternalServerError, ValidationOverflowError, DivisionByZeroError, createError };