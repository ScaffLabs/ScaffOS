// Import necessary modules
import { Router } from 'express';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from '../handlers/strategyHandler';
import { validateInputBody, validateQueryParams, validateRequestSize } from '../middleware/inputValidator';
import { validateStrategy, validateUpdateStrategy } from '../middleware/strategyValidator';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
 *         description: Number of strategies to skip
 *         required: false
 *         schema:
 *           type: integer
 *       - name: name
 *         in: query
 *         description: Filter strategies by name
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of strategies
 */
router.get('/', limiter, validateQueryParams, getStrategiesHandler);

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
 */
router.post('/', limiter, validateInputBody, validateRequestSize, validateStrategy, createStrategyHandler);

/**
 * @swagger
 * /api/strategies/{id}:
 *   put:
 *     summary: Update an existing strategy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the strategy to update
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
 */
router.put('/:id', limiter, validateInputBody, validateUpdateStrategy, updateStrategyHandler);

/**
 * @swagger
 * /api/strategies/{id}:
 *   delete:
 *     summary: Delete a strategy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the strategy to delete
 *     responses:
 *       204:
 *         description: Strategy deleted
 */
router.delete('/:id', limiter, deleteStrategyHandler);

export default router;