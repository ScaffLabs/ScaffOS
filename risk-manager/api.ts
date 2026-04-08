import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import RateLimit from 'express-rate-limit';
import RiskManager from './riskManager';
import authMiddleware from './authMiddleware';
import axios from 'axios';
import { setReady } from './healthCheck';
import logger from './logger'; // Importing logger

const router = express.Router();
const riskManager = new RiskManager();

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const checkServiceHealth = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

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

router.get('/risk', limiter, async (req: Request, res: Response) => {
  const { limit = 10, offset = 0, sort, filter } = req.query;
  try {
    const positions = await riskManager.getRiskPositions(Number(limit), Number(offset), sort, filter);
    res.status(200).json(positions);
  } catch (error) {
    logger.error(`Error fetching risk positions: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/risk', limiter, authMiddleware, body('asset').isString(), body('position').isNumeric(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { asset, position } = req.body;
  try {
    const newPosition = await riskManager.createRiskPosition(asset, position);
    res.status(201).json(newPosition);
  } catch (error) {
    logger.error(`Error creating risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/risk/:id', limiter, authMiddleware, body('position').isNumeric(), async (req: Request, res: Response) => {
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
    res.status(204).send();
  } catch (error) {
    logger.error(`Error updating risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/risk/:id', limiter, authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await riskManager.deleteRiskPosition(id);
    if (!deleted) {
      return res.status(404).send('Risk position not found');
    }
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting risk position: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
