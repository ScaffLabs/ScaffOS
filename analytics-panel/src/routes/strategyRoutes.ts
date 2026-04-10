import { Router } from 'express';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from '../handlers/strategyHandler';
import { validateInputBody, validateRequestSize } from '../middleware/inputValidator';
import { validateStrategy, validateUpdateStrategy } from '../middleware/strategyValidator';
import rateLimit from 'express-rate-limit';
import { auditLogger } from '../middleware/auditLogger';
import helmet from 'helmet';
import cors from 'cors';

const router = Router();

// CORS and security middlewares
router.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
router.use(helmet());

// Rate limiter middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

// GET all strategies with pagination
router.get('/', limiter, getStrategiesHandler);

// Create new strategy
router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, auditLogger, createStrategyHandler);

// Update existing strategy
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, auditLogger, updateStrategyHandler);

// Delete strategy by ID
router.delete('/:id', limiter, auditLogger, deleteStrategyHandler);

export default router;