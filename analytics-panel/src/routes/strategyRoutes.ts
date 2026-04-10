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

/**
 * @swagger
 * /api/strategies:
 *   get:
 *     summary: Retrieve a list of strategies
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of strategies to return
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Offset for pagination
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of strategies
 *       400:
 *         description: Bad request
 */
router.get('/', limiter, validateQueryParams, auditLogger, getStrategiesHandler);

/**
 * @swagger
 * /api/strategies:
 *   post:
 *     summary: Create a new strategy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Strategy created
 *       400:
 *         description: Invalid input
 */
router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, auditLogger, createStrategyHandler);

/**
 * @swagger
 * /api/strategies/{id}:
 *   put:
 *     summary: Update an existing strategy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the strategy to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Strategy updated
 *       404:
 *         description: Strategy not found
 */
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, auditLogger, updateStrategyHandler);

/**
 * @swagger
 * /api/strategies/{id}:
 *   delete:
 *     summary: Delete a strategy by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the strategy to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Strategy deleted
 *       404:
 *         description: Strategy not found
 */
router.delete('/:id', limiter, auditLogger, deleteStrategyHandler);

export default router;