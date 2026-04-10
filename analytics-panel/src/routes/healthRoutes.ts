import { Router } from 'express';
import { healthCheckHandler, dependentHealthCheckHandler, readyCheckHandler } from '../handlers/healthCheck';
import { monitorMemoryUsage } from '../utils/monitor';
import { gracefulShutdown } from '../utils/shutdown';

const router = Router();

// Health check endpoint for application status
router.get('/health', healthCheckHandler);

// Health check endpoint for dependent services
router.get('/health/dependencies', dependentHealthCheckHandler);

// Ready check endpoint to determine if application is ready to receive requests
router.get('/ready', readyCheckHandler);

setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every minute

// Graceful shutdown handler
process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

export default router;