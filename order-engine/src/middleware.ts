import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { OrderSchemas } from './types';

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
    max: 100
  })
];

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }
  next();
};