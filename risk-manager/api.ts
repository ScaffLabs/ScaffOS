import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from './errors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './logger';

const router = express.Router();

// Use the request logger middleware
router.use(requestLogger);

// CORS configuration
const allowedOrigins = ['http://example.com', 'http://another-example.com'];
router.use(cors({ origin: allowedOrigins }));
router.use(helmet()); // Set secure HTTP headers

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});
router.use(limiter);

// Define routes here (GET, POST, etc.)

export default router;