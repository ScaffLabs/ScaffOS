import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import RiskManager from './riskManager';
import authMiddleware from './authMiddleware';
import axios from 'axios';
import { setReady } from './healthCheck';
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

router.get('/health', async (req: Request, res: Response) => {
  const serviceHealth = await Promise.all([
    checkServiceHealth(process.env.EVENT_BUS_URL || ''),
    checkServiceHealth(process.env.ANOTHER_SERVICE_URL || ''),
  ]);
  const isHealthy = serviceHealth.every(status => status);
  setReady(isHealthy);
  res.status(200).json({ status: isHealthy ? 'healthy' : 'unhealthy' });
});

router.get('/risk', async (req: Request, res: Response) => {
  const { limit = 10, offset = 0, sort, filter } = req.query;
  try {
    const positions = await riskManager.getRiskPositions(Number(limit), Number(offset), sort, filter);
    res.status(200).json(positions);
  } catch (error) {
    logger.error(`Error fetching risk positions: ${error.message}`);
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
    logger.error(`Error creating risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/risk/:id', authMiddleware, body('position').isNumeric(), async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { position } = req.body;
  try {
    const updated = await riskManager.updateRiskPosition(id, position);
    if (!updated) {
      return res.status(404).send('Risk position not found');
    }
    logger.info(`Risk position updated: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error updating risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/risk/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await riskManager.deleteRiskPosition(id);
    if (!deleted) {
      return res.status(404).send('Risk position not found');
    }
    logger.info(`Risk position deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;