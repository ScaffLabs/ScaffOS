import { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { ValidationError } from '../utils/errors';

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

export const securityMiddleware = (app: any) => {
    app.use(helmet()); // Set security HTTP headers
    app.use(cors({ origin: allowedOrigins })); // Enable CORS with allowed origins
    app.use(limiter); // Apply rate limiting
};

export const validateAndLog = (req: Request, res: Response, next: Function) => {
    const errors = [];
    const { symbol, quantity } = req.body;
    if (typeof symbol !== 'string' || validator.isEmpty(symbol)) {
        errors.push('Invalid stock symbol');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        errors.push('Invalid quantity');
    }
    if (errors.length) {
        return res.status(400).json({ errors });
    }
    req.body.symbol = validator.escape(symbol); // Escape to prevent XSS
    next();
};

export const validatePositionId = (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
        throw new ValidationError('Invalid position ID');
    }
    next();
};

export const validateRequestSize = (maxSize: string) => {
    return (req: Request, res: Response, next: Function) => {
        const contentLength = req.headers['content-length'];
        if (contentLength && Number(contentLength) > Number(maxSize)) {
            return res.status(413).json({ message: 'Payload too large' });
        }
        next();
    };
};