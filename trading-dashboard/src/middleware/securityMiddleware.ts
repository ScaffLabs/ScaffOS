import { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { validatePositionInput } from './inputValidation';

const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

export const securityMiddleware = (app: any) => {
    app.use(helmet());
    app.use(cors({ origin: allowedOrigins }));
    app.use(limiter);
};

export const validateAndLog = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};