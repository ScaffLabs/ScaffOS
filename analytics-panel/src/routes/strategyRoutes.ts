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

// Configure CORS and Helmet middleware
router.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
router.use(helmet());

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

// Get strategies with pagination and sorting
router.get('/', limiter, validateRequestSize, async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'name', order = 'asc' } = req.query;
    try {
        const strategies = await findStrategies({});
        const sortedStrategies = strategies.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });
        const paginatedStrategies = sortedStrategies.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedStrategies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch strategies.' });
    }
});

router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, auditLogger, createStrategyHandler);
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, auditLogger, updateStrategyHandler);
router.delete('/:id', limiter, auditLogger, deleteStrategyHandler);

export default router;