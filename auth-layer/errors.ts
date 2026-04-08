class ServiceError extends Error { constructor(message: string) { super(message); this.name = 'ServiceError'; } }
class ValidationError extends Error { constructor(errors: string[]) { super('Validation error'); this.errors = errors; this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }
export { ServiceError, ValidationError, NotFoundError };