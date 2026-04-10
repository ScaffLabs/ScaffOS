import { Router } from 'express';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from '../handlers/strategyHandler';
import { validateInputBody, validateQueryParams, validateRequestSize } from '../middleware/inputValidator';
import { validateStrategy, validateUpdateStrategy } from '../middleware/strategyValidator';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();

// Rate limiter for strategy routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.',
});

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Analytics Panel API',
            version: '1.0.0',
            description: 'API documentation for the Analytics Panel',
        },
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

router.get('/', limiter, validateQueryParams, auditLogger, getStrategiesHandler);
router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, auditLogger, createStrategyHandler);
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, auditLogger, updateStrategyHandler);
router.delete('/:id', limiter, auditLogger, deleteStrategyHandler);

export default router;