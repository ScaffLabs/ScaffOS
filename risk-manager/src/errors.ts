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
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    } else if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    } else if (err instanceof ServiceError) {
        return res.status(500).json({ error: 'Service Error: ' + err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export { ServiceError, ValidationError, NotFoundError, errorHandler };