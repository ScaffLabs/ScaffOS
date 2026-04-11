import { AlertMessage } from './alert.schema';
import { EventBus } from './event-bus';
import axios from 'axios';
import { ServiceError } from './error.types';
import { CircuitBreaker } from 'opossum';
import logger from './logger';

const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000
};

const webhookCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.WEBHOOK_URL, alert);
}, options);

const emailServiceCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.EMAIL_SERVICE_URL, alert);
}, options);

export class AlertProcessor {
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    public async processAlert(alert: AlertMessage) {
        const start = Date.now();
        try {
            await this.sendAlertToServices(alert);
            this.eventBus.publish('alert.processed', alert);
            const duration = Date.now() - start;
            logger.logPerformance('processAlert', duration);
        } catch (error) {
            logger.error('Error processing alert:', error);
            throw new ServiceError('Failed to process alert.');
        }
    }

    private async sendAlertToServices(alert: AlertMessage) {
        const sendAlert = async (attempt = 0) => {
            try {
                await Promise.all([
                    webhookCircuit.fire(alert),
                    emailServiceCircuit.fire(alert)
                ]);
            } catch (error) {
                if (attempt < 5) {
                    await new Promise(res => setTimeout(res, retryDelay(attempt)));
                    return sendAlert(attempt + 1);
                }
                logger.error('Error sending alert to services:', error);
                throw new ServiceError('Failed to notify services.');
            }
        };
        await sendAlert();
    }
}

const retryDelay = (attempt: number) => {
    return Math.pow(2, attempt) * 100; // Exponential backoff
};