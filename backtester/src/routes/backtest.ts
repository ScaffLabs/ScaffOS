import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema, PaginationSchema } from '../types';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import xss from 'xss';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

const backtestRouter = Router();
const store = new InMemoryStore();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: 'Too many requests from this IP, please try again later.',
});

backtestRouter.use(limiter);

backtestRouter.post('/', async (req, res, next) => {
    const { strategyParams, historicalData } = req.body;
    try {
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            HistoricalDataSchema.parse(data);
            if (typeof data.timestamp !== 'number' || typeof data.price !== 'number') {
                throw new ValidationError('Each historical data entry must have a numeric timestamp and price.');
            }
        });

        const sanitizedStrategyParams = {
            ...strategyParams,
            buyThreshold: parseFloat(strategyParams.buyThreshold.toString()),
            sellThreshold: parseFloat(strategyParams.sellThreshold.toString()),
            slippage: parseFloat(strategyParams.slippage.toString()),
        };

        const result = await simulateBacktest(sanitizedStrategyParams, historicalData);
        const entity = await store.create({ strategyParams, historicalData, result });
        res.status(201).json({ id: entity.id, result });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(error);
        }
        next(new ServiceError('Error during backtest: ' + error.message));
    }
});

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
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

export { backtestRouter };