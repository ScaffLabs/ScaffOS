import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { OrderSchemas } from './types';
import { body, validationResult } from 'express-validator';

const allowedOrigins = ['http://example.com', 'http://anotherdomain.com'];

export const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200
};

export const securityMiddleware = [
  helmet(),
  cors(corsOptions),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  })
];

export const validateOrder = [
  body('id').isString().trim().escape(),
  body('type').isIn(['limit', 'market', 'stop']),
  body('price').isFloat({ gt: 0 }),
  body('quantity').isFloat({ gt: 0 }),
  body('status').isIn(['open', 'filled', 'cancelled']),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];