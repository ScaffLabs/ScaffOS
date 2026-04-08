import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { healthCheckServices } from '../services/healthCheckService';
import { StrategyParametersSchema, HistoricalDataSchema } from '../types';
import { ValidationError } from '../middleware/errorHandler';
import rateLimit from 'express-rate-limit';
import InMemoryStore from '../storage/InMemoryStore';

const backtestRouter = Router();
const store = new InMemoryStore();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

backtestRouter.use(limiter);

/**
 * @swagger
 * /api/backtest:
 *   post:
 *     summary: Perform a backtest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               strategyParams:
 *                 type: object
 *               historicalData:
 *                 type: array
 *                 items:
 *                   type: object
 *             required:
 *               - strategyParams
 *               - historicalData
 *     responses:
 *       200:
 *         description: Successful backtest
 *       400:
 *         description: Bad input
 */
backtestRouter.post('/', async (req, res, next) => {
  const { strategyParams, historicalData } = req.body;
  try {
    StrategyParametersSchema.parse(strategyParams);
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      throw new ValidationError('historicalData must be a non-empty array.');
    }
    historicalData.forEach(data => HistoricalDataSchema.parse(data));

    const result = await simulateBacktest(strategyParams, historicalData);
    const entity = await store.create({ strategyParams, historicalData, result });
    res.status(201).json({ id: entity.id, result });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(error);
    }
    next(new Error('Error during backtest'));
  }
});

/**
 * @swagger
 * /api/backtest/{id}:
 *   get:
 *     summary: Get backtest result by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the backtest result
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Found the backtest result
 *       404:
 *         description: Backtest result not found
 */
backtestRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await store.read(id);
    if (!result) {
      return next(new ValidationError('Backtest result not found.'));
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/backtest:
 *   get:
 *     summary: List all backtest results with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: A list of backtest results
 */
backtestRouter.get('/', async (req, res, next) => {
  const { limit = 10, offset = 0 } = req.query;
  try {
    const results = await store.findAll();
    const paginatedResults = results.slice(offset, offset + limit);
    res.status(200).json(paginatedResults);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/backtest/{id}:
 *   delete:
 *     summary: Delete a backtest result
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the backtest result to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Backtest result not found
 */
backtestRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleted = await store.delete(id);
    if (!deleted) {
      return next(new ValidationError('Backtest result not found.'));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

backtestRouter.get('/health', async (req, res, next) => {
  try {
    const healthResults = await healthCheckServices();
    res.status(200).json({ health: healthResults });
  } catch (error) {
    next(new Error('Health check failed'));
  }
});

export { backtestRouter };