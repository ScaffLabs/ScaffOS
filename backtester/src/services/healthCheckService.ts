import axios from 'axios';
import { EventEmitter } from 'events';
import logger from '../utils/logger';

const eventEmitter = new EventEmitter();

const serviceUrls = {
  orderService: process.env.ORDER_SERVICE_URL,
  dataService: process.env.DATA_SERVICE_URL
};

async function checkService(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    logger.error(`Health check failed for ${url}: ${error.message}`);
    return false;
  }
}

export async function healthCheckServices() {
  const results = await Promise.all(Object.entries(serviceUrls).map(async ([key, url]) => {
    const isHealthy = await checkService(url);
    eventEmitter.emit('healthCheck', { service: key, healthy: isHealthy });
    return { service: key, healthy: isHealthy };
  }));
  return results;
}

export { eventEmitter };