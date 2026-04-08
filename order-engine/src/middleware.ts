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

/**
 * Middleware for validating order requests against schemas.
 */
export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const result = OrderSchemas.OrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  next();
};

export const validateOrderUpdate = (req: Request, res: Response, next: NextFunction) => {
  const result = OrderSchemas.OrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  next();
};