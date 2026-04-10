import { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

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

export const validatePositionInput = (req: Request, res: Response, next: Function) => {
    const { symbol, quantity } = req.body;
    if (typeof symbol !== 'string' || validator.isEmpty(symbol)) {
        throw new ValidationError('Invalid stock symbol');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new ValidationError('Invalid quantity');
    }
    req.body.symbol = validator.escape(symbol); // Escape to prevent XSS
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

export const csrfMiddleware = (req: Request, res: Response, next: Function) => {
    // Implement CSRF protection using csurf
    next();
};

export const logSensitiveOperations = (req: Request, res: Response, next: Function) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        logger.info('Sensitive operation performed', { method: req.method, path: req.path, body: req.body });
    }
    next();
};

export const applySecurityMiddlewares = (app: any) => {
    app.use(securityMiddleware);
    app.use(logSensitiveOperations);
};
