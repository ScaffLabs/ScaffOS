import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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
    max: 100
  })
];

export const validateOrder = [
  body('id').isString().escape(),
  body('type').isIn(['limit', 'market', 'stop']).escape(),
  body('price').isNumeric().toFloat(),
  body('quantity').isNumeric().toInt(),
  body('status').isIn(['open', 'filled', 'cancelled']).escape(),
];

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};