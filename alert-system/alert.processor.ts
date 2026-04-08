import { AlertMessage } from './alert.schema';
import { EventBus } from '../event-bus';
import axios from 'axios';
import { ServiceError, ValidationError } from './error.types';
import { CircuitBreaker } from 'opossum';

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // After 50% failures, open the circuit
    resetTimeout: 10000 // After 10 seconds, try again
};

const webhookCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.WEBHOOK_URL, alert);
}, options);

const emailServiceCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.EMAIL_SERVICE_URL, alert);
}, options);

export class AlertProcessor {
    // Existing constructor and methods...

    private async sendAlertToServices(alert: AlertMessage) {
        try {
            await Promise.all([
                webhookCircuit.fire(alert),
                emailServiceCircuit.fire(alert)
            ]);
        } catch (error) {
            console.error('Error sending alert to services:', error);
            throw new ServiceError('Failed to notify services.');
        }
    }
}