import { Router } from 'express';
import { healthCheckServices } from '../services/healthCheckService';
import logger from '../utils/logger';

const healthCheckRouter = Router();

healthCheckRouter.get('/health', async (req, res) => {
  try {
    const results = await healthCheckServices();
    const allHealthy = results.every(result => result.healthy);
    res.status(200).json({ status: allHealthy ? 'healthy' : 'unhealthy', services: results });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

healthCheckRouter.get('/ready', async (req, res) => {
  try {
    // Here we can check if the service is ready to accept requests
    const results = await healthCheckServices();
    const isReady = results.every(result => result.healthy);
    res.status(200).json({ status: isReady ? 'ready' : 'not ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(500).json({ status: 'not ready', error: error.message });
  }
});

export default healthCheckRouter;
