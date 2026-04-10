import { Router } from 'express';
import { checkAllHealth } from '../services/healthCheckService';
import logger from '../utils/logger';

const healthCheckRouter = Router();

healthCheckRouter.get('/', async (req, res) => {
  try {
    const results = await checkAllHealth();
    res.status(200).json({ status: results.healthy ? 'healthy' : 'unhealthy', services: results.details });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default healthCheckRouter;