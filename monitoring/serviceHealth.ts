import { Request, Response } from 'express';
import axios from 'axios';
import EventEmitter from 'eventemitter3';
import config from './config';
import logger from './logger';

const serviceEmitter = new EventEmitter();
const SERVICE_URLS = {
    orderService: config.ORDER_SERVICE_URL,
    userService: config.USER_SERVICE_URL
};

const MAX_RETRIES = 3;
const TIMEOUT = 5000;

const checkService = async (service: string, retries = MAX_RETRIES): Promise<boolean> => {
    try {
        const response = await axios.get(`${SERVICE_URLS[service]}/health`, { timeout: TIMEOUT });
        const status = response.data.status === 'UP';
        logger.logServiceHealth(service, status);
        return status;
    } catch (error) {
        logger.error({ error: error.message }, `Error checking ${service}`);
        if (retries > 0) {
            return checkService(service, retries - 1);
        }
        return false;
    }
};

export const checkServiceHealth = async (req: Request, res: Response) => {
    try {
        const results = await Promise.all(Object.keys(SERVICE_URLS).map(service => checkService(service)));
        const servicesStatus = Object.keys(SERVICE_URLS).reduce((acc, service, index) => {
            acc[service] = results[index];
            return acc;
        }, {});
        serviceEmitter.emit('serviceStatus', servicesStatus);
        res.status(200).json(servicesStatus);
    } catch (error) {
        logger.error({ error: error.message }, 'Health check failed');
        res.status(500).json({ error: 'Health check failed' });
    }
};

serviceEmitter.on('serviceStatus', (status) => {
    logger.info('Service status updated:', status);
});

export default serviceEmitter;