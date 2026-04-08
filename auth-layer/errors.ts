class ServiceError extends Error { constructor(message: string) { super(message); this.name = 'ServiceError'; } }
class ValidationError extends Error { constructor(errors: string[]) { super('Validation error'); this.errors = errors; this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }
class InternalServerError extends Error { constructor(message: string) { super(message); this.name = 'InternalServerError'; } }
export { ServiceError, ValidationError, NotFoundError, InternalServerError };