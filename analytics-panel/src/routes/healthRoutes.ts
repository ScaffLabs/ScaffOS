import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler } from '../handlers/healthCheck';

const router = Router();

// Health check endpoint for application status
router.get('/health', healthCheckHandler);

// Health check endpoint for dependent services
router.get('/health/dependencies', dependentHealthCheckHandler);

export default router;