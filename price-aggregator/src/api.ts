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
});
router.use(limiter);
router.use(cors());
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

// Other routes remain unchanged...
export default router;