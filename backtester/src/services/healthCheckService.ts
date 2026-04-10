import axios from 'axios';
import logger from '../utils/logger';
import { Pool } from 'pg'; // PostgreSQL connection pooling
import { circuitBreaker, withRetry } from './resilience';

const serviceUrls = {
  orderService: process.env.ORDER_SERVICE_URL,
  dataService: process.env.DATA_SERVICE_URL
};

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkService(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    logger.error(`Health check failed for ${url}: ${error.message}`);
    return false;
  }
}

const checkServiceWithCircuitBreaker = circuitBreaker(checkService, 5, false);

export async function healthCheckServices() {
  const results = await Promise.all(Object.entries(serviceUrls).map(async ([key, url]) => {
    const isHealthy = await checkServiceWithCircuitBreaker(url);
    return { service: key, healthy: isHealthy };  
  }));
  return results;
}

export async function checkReadiness() {
  try {
    await pool.query('SELECT 1'); // Check database connection
    return { healthy: true };
  } catch (error) {
    logger.error('Database connection failed:', error);
    return { healthy: false };  
  }
}

export async function healthCheckController(req, res) {
  try {
    const health = await healthCheckServices();
    const readiness = await checkReadiness();
    res.status(200).json({ health, readiness });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
}

// Health check endpoint for /health
export const healthCheckRouter = Router();
healthCheckRouter.get('/', healthCheckController);

// Readiness endpoint for /ready
healthCheckRouter.get('/ready', async (req, res) => {
  const readiness = await checkReadiness();
  res.status(readiness.healthy ? 200 : 503).json(readiness);
});