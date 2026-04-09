import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema, PaginationSchema } from '../types';

const backtestRouter = Router();
const store = new InMemoryStore();

/**
 * @swagger
 * /api/backtest:
 *   post:
 *     summary: Create a backtest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               strategyParams:
 *                 type: object
 *                 required:
 *                   - slippage
 *                   - buyThreshold
 *                   - sellThreshold
 *               historicalData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: integer
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Backtest created successfully
 *       400:
 *         description: Invalid input
 */
backtestRouter.post('/', async (req, res, next) => {
    const { strategyParams, historicalData } = req.body;
    try {
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            HistoricalDataSchema.parse(data);
        });

        const result = await simulateBacktest(strategyParams, historicalData);
        const entity = await store.create({ strategyParams, historicalData, result });
        logger.info({ message: 'Backtest created', id: entity.id });
        res.status(201).json({ id: entity.id, result });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.warn({ message: 'Validation error', error: error.message });
            return next(error);
        }
        next(new ServiceError('Error during backtest: ' + error.message));
    }
});

/**
 * @swagger
 * /api/backtest:
 *   get:
 *     summary: Get backtest results with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return (default 10)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of results to skip (default 0)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (default createdAt)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sorting order (default asc)
 *     responses:
 *       200:
 *         description: A list of backtest results
 */
backtestRouter.get('/', async (req, res, next) => {
    const { limit, offset, sort, order } = PaginationSchema.parse(req.query);
    try {
        const results = await store.findAll();
        const sortedResults = results.sort((a, b) => {
            const aValue = a.data[sort];
            const bValue = b.data[sort];
            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });
        const paginatedResults = sortedResults.slice(offset, offset + limit);
        res.status(200).json({ total: sortedResults.length, results: paginatedResults });
    } catch (error) {
        next(new ServiceError('Error fetching backtests: ' + error.message));
    }
});

/**
 * @swagger
 * /api/backtest/{id}:
 *   get:
 *     summary: Get a specific backtest result
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the backtest result
 *     responses:
 *       200:
 *         description: Backtest result found
 *       404:
 *         description: Backtest result not found
 */
backtestRouter.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await store.read(id);
        if (!result) {
            throw new NotFoundError('Backtest result not found.');
        }
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn({ message: 'Not found error for ID', id });
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

export { backtestRouter };