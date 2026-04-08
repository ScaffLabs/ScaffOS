import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import RateLimit from 'express-rate-limit';
import RiskManager from './riskManager';
import authMiddleware from './authMiddleware';
import axios from 'axios';
import { setReady } from './healthCheck';

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
  const positions = await riskManager.getRiskPositions(Number(limit), Number(offset), sort, filter);
  res.status(200).json(positions);
});

router.post('/risk', limiter, authMiddleware, body('asset').isString(), body('position').isNumeric(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { asset, position } = req.body;
  const newPosition = await riskManager.createRiskPosition(asset, position);
  res.status(201).json(newPosition);
});

router.put('/risk/:id', limiter, authMiddleware, body('position').isNumeric(), async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { position } = req.body;
  const updated = await riskManager.updateRiskPosition(id, position);
  if (!updated) {
    return res.status(404).send('Risk position not found');
  }
  res.status(204).send();
});

router.delete('/risk/:id', limiter, authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await riskManager.deleteRiskPosition(id);
  if (!deleted) {
    return res.status(404).send('Risk position not found');
  }
  res.status(204).send();
});

export default router;