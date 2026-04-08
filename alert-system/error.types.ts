export class ServiceError extends Error { constructor(message: string) { super(message); this.name = 'ServiceError'; } }

export class ValidationError extends Error { constructor(message: string) { super(message); this.name = 'ValidationError'; } }

export class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }