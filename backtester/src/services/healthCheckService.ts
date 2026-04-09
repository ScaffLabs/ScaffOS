import axios from 'axios';
import logger from '../utils/logger';
import { circuitBreaker } from './resilience';

const serviceUrls = {
  orderService: process.env.ORDER_SERVICE_URL,
  dataService: process.env.DATA_SERVICE_URL
};

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

export async function checkAllHealth() {
  const servicesHealth = await healthCheckServices();
  const allHealthy = servicesHealth.every(result => result.healthy);
  return { healthy: allHealthy, details: servicesHealth };
}

export async function checkReadiness() {
  const servicesHealth = await healthCheckServices();
  const allHealthy = servicesHealth.every(result => result.healthy);
  return { healthy: allHealthy };
}
