import { Request, Response } from 'express';
import axios from 'axios';
import EventEmitter from 'eventemitter3';
import config from './config';
import logger from './logger';
import { MonitoringEvent, MonitoringEventSchema } from './types';

const serviceEmitter = new EventEmitter();
const SERVICE_URLS = {
    orderService: config.ORDER_SERVICE_URL,
    userService: config.USER_SERVICE_URL
};

const MAX_RETRIES = 3;
const TIMEOUT = 5000;

const checkService = async (service: keyof typeof SERVICE_URLS, retries = MAX_RETRIES): Promise<boolean> => {
    try {
        const response = await axios.get(`${SERVICE_URLS[service]}/health`, { timeout: TIMEOUT });
        return response.data.status === 'UP';
    } catch (error) {
        logger.error({ error: error.message }, `Error checking ${service}`);
        if (retries > 0) {
            return checkService(service, retries - 1);
        }
        return false;
    }
};

export const checkServiceHealth = async (): Promise<Record<string, boolean>> => {
    const results = await Promise.all(Object.keys(SERVICE_URLS).map(service => checkService(service as keyof typeof SERVICE_URLS)));
    return Object.keys(SERVICE_URLS).reduce((acc, service, index) => {
        acc[service] = results[index];
        return acc;
    }, {} as Record<string, boolean>);
};

export const emitHealthCheckEvent = async () => {
    const healthStatus = await checkServiceHealth();
    const event: MonitoringEvent = { type: 'SERVICE_HEALTH_CHECK', status: healthStatus };
    const validation = MonitoringEventSchema.safeParse(event);
    if (validation.success) {
        serviceEmitter.emit('healthCheck', event);
    } else {
        logger.error('Invalid health check event schema.');
    }
};

export const monitorMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.rss / (1024 * 1024);
    const usedMemory = memoryUsage.heapUsed / (1024 * 1024);
    logger.info({ totalMemory, usedMemory }, 'Memory usage monitored');
};

export const healthCheckServices = async () => {
    const healthStatus = await checkServiceHealth();
    return Object.values(healthStatus).every(status => status);
};