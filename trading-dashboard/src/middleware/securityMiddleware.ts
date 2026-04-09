import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { logSensitiveOperation } from '../utils/logger';

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

// Input validation middleware
const validatePositionInput = [
    body('symbol').isString().notEmpty().withMessage('Symbol is required'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
];

// Security middleware function
export const securityMiddleware = (app: any) => {
    app.use(helmet()); // Set security-related HTTP headers
    app.use(cors({ origin: allowedOrigins })); // Enable CORS
    app.use(limiter); // Apply rate limiting
};

// Function to validate input and log sensitive operations
export const validateAndLog = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.method === 'POST' || req.method === 'PUT') {
        logSensitiveOperation('Input validated', req.body.userId);
    }
    next();
};

// Export validation middleware for use in routes
export { validatePositionInput };