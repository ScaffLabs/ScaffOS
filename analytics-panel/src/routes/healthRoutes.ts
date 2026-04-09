// Import necessary modules
import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler, readyCheckHandler } from '../handlers/healthCheck';
import { healthCheckDependentServices } from '../api/analytics';
import { monitorMemoryUsage } from '../utils/monitor';

const router = Router();

// Health check endpoint for application status
router.get('/health', healthCheckHandler);

// Health check endpoint for dependent services
router.get('/health/dependencies', dependentHealthCheckHandler);

// Ready check endpoint to determine if application is ready to receive requests
router.get('/ready', readyCheckHandler);

setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every minute

export default router;