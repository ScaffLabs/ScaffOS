import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validateContentType } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest, logError } from './logger';
import { ValidationError, ServiceError } from './errors';

const router = express.Router();
const priceAggregator = new PriceAggregator();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

router.use(limiter);
router.use(cors({ origin: ['https://allowed-origin.com', 'https://another-allowed-origin.com'] }));
router.use(helmet());

router.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

router.get('/health', async (req, res, next) => {
    try {
        const healthStatus = await priceAggregator.checkDependenciesHealth();
        res.status(200).json({ status: 'healthy', dependencies: healthStatus });
    } catch (error) {
        logError(error);
        next(new ServiceError('Failed to check health status.'));
    }
});

router.post('/prices', validateContentType, validatePriceData, handleValidationErrors, async (req, res, next) => {
    try {
        const priceData = req.body;
        const newPrice = await priceAggregator.addPrice(priceData);
        res.status(201).json(newPrice);
    } catch (error) {
        logError(error);
        next(error);
    }
});

router.delete('/prices/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await priceAggregator.deletePrice(id);
        res.status(204).send();
    } catch (error) {
        logError(error);
        next(new ServiceError('Failed to delete price.'));
    }
});

export default router;