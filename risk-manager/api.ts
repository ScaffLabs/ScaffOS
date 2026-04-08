import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import RiskManager from './riskManager';
import authMiddleware from './authMiddleware';
import logger from './logger';

const router = express.Router();
const riskManager = new RiskManager();
const limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

router.use(cors({ origin: ['http://allowed-origin.com'], credentials: true }));
router.use(helmet());
router.use(express.json({ limit: '1mb' }));
router.use(limiter);

router.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

router.get('/risk', async (req: Request, res: Response) => {
    try {
        const positions = await riskManager.getRiskPositions(req.query.limit, req.query.offset);
        res.status(200).json(positions);
    } catch (error) {
        logger.error(`Error fetching risk positions: ${error.stack}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/risk', authMiddleware, body('asset').isString().trim().escape(), body('position').isNumeric(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { asset, position } = req.body;
    try {
        const newPosition = await riskManager.createRiskPosition(asset, position);
        logger.info(`Risk position created: ${newPosition.id}`);
        res.status(201).json(newPosition);
    } catch (error) {
        logger.error(`Error creating risk position: ${error.stack}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Similar error handling for PUT and DELETE routes...

export default router;