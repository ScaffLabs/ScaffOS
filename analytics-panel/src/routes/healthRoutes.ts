import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';

const router = Router();

router.get('/health', healthCheckHandler);
router.get('/health/dependencies', dependentHealthCheckHandler);

export default router;