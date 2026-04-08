import { Request, Response } from 'express';
import axios from 'axios';
import EventEmitter from 'eventemitter3';
import config from './config';

const serviceEmitter = new EventEmitter();
const SERVICE_URLS = {
    orderService: config.ORDER_SERVICE_URL,
    userService: config.USER_SERVICE_URL
};

const checkService = async (service: string) => {
    try {
        const response = await axios.get(`${SERVICE_URLS[service]}/health`, { timeout: 5000 });
        return response.data.status === 'UP';
    } catch (error) {
        console.error(`Error checking ${service}:`, error.message);
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
        console.error('Health check failed:', error.message);
        res.status(500).json({ error: 'Health check failed' });
    }
};

serviceEmitter.on('serviceStatus', (status) => {
    console.log('Service status updated:', status);
});

export default serviceEmitter;