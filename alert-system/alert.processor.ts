import { AlertMessage } from './alert.schema';
import { EventBus } from '../event-bus';
import { ServiceError, ValidationError } from './error.types';

export class AlertProcessor {
    constructor(private eventBus: EventBus) {
        this.eventBus.subscribe('price-update', this.handlePriceUpdate.bind(this));
        this.eventBus.subscribe('risk-alert', this.handleRiskAlert.bind(this));
    }

    async handlePriceUpdate(priceData: { currentValue: number; threshold: number; }) {
        try {
            this.evaluateAndPublishAlert(priceData, 'price');
        } catch (error) {
            console.error('Error handling price update:', error);
        }
    }

    async handleRiskAlert(riskData: { currentValue: number; threshold: number; }) {
        try {
            this.evaluateAndPublishAlert(riskData, 'risk');
        } catch (error) {
            console.error('Error handling risk alert:', error);
        }
    }

    private evaluateAndPublishAlert(data: { currentValue: number; threshold: number; }, alertType: string) {
        if (!data || typeof data.currentValue !== 'number' || typeof data.threshold !== 'number') {
            throw new ValidationError('Invalid data format.');
        }
        const alert: AlertMessage = {
            id: Date.now().toString(),
            type: alertType,
            threshold: data.threshold,
            currentValue: data.currentValue,
            createdAt: new Date()
        };
        if (data.currentValue >= data.threshold) {
            this.eventBus.publish(`${alertType}-alert`, alert);
        }
    }
}