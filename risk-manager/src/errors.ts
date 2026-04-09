import { Request, Response, NextFunction } from 'express';

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

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    switch (err.name) {
        case 'ValidationError':
            return res.status(400).json({ error: err.message });
        case 'NotFoundError':
            return res.status(404).json({ error: err.message });
        case 'ServiceError':
        default:
            return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { ServiceError, ValidationError, NotFoundError, errorHandler };