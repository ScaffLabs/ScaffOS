import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';
import { readyCheckHandler } from '../handlers/readyCheck';
import { logError } from '../utils/errorLogger';

const router = Router();

// Health check endpoint for application status
router.get('/health', healthCheckHandler);

// Health check endpoint for dependent services
router.get('/health/dependencies', dependentHealthCheckHandler);

// Ready check endpoint for application readiness
router.get('/ready', readyCheckHandler);

export default router;