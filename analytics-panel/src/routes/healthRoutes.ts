import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';
import { readyCheckHandler } from '../handlers/readyCheck';

const router = Router();

router.get('/health', healthCheckHandler);
router.get('/health/dependencies', dependentHealthCheckHandler);
router.get('/ready', readyCheckHandler);

export default router;