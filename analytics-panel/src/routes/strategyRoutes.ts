import { Router } from 'express';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from '../handlers/strategyHandler';
import { validateInputBody, validateRequestSize } from '../middleware/inputValidator';
import { validateStrategy, validateUpdateStrategy } from '../middleware/strategyValidator';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { auditLogger } from '../middleware/auditLogger';
import helmet from 'helmet';
import cors from 'cors';
import { logWithRequestId } from '../logger';

const router = Router();

router.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
router.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

router.get('/', limiter, getStrategiesHandler);
router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, auditLogger, createStrategyHandler);
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, auditLogger, updateStrategyHandler);
router.delete('/:id', limiter, auditLogger, deleteStrategyHandler);

export default router;