import { Router } from 'express';
import { checkAllHealth, checkReadiness } from '../services/healthCheckService';
import logger from '../utils/logger';
import { monitorMemoryUsage } from '../utils/monitor';

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

healthCheckRouter.get('/ready', async (req, res) => {
  try {
    const readiness = await checkReadiness();
    res.status(200).json({ status: readiness.healthy ? 'ready' : 'not ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(500).json({ status: 'not ready', error: error.message });
  }
});

healthCheckRouter.get('/memory', (req, res) => {
  const used = process.memoryUsage();
  const total = used.heapTotal + used.external;
  res.status(200).json({
    memory: {
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024),
      total: Math.round(total / 1024 / 1024)
    }
  });
});

healthCheckRouter.get('/health-check', async (req, res) => {
  const used = process.memoryUsage();
  res.status(200).json({
    status: 'healthy',
    memory: {
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024)
    },
  });
});

export default healthCheckRouter;