import axios from 'axios';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import { circuitBreaker } from './resilience';

const eventEmitter = new EventEmitter();

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
    eventEmitter.emit('healthCheck', { service: key, healthy: isHealthy });
    return { service: key, healthy: isHealthy };
  }));
  return results;
}

export { eventEmitter };

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

export async function checkServiceDependencies() {
  const health = await healthCheckServices();
  const allHealthy = health.every(service => service.healthy);
  return allHealthy;
}

export async function healthCheckMemoryUsage() {
  const used = process.memoryUsage();
  const total = used.heapTotal + used.external;
  return {
    memory: {
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024),
      total: Math.round(total / 1024 / 1024)
    }
  };
}
