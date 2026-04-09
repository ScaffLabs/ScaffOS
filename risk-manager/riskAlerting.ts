import { EventEmitter } from 'events';
import logger from './logger';

export class RiskAlerting {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    onRiskAlert(callback: (message: string) => void) {
        this.eventEmitter.on('riskAlert', callback);
        logger.info('Risk alert listener added.');
    }

    triggerRiskAlert(message: string) {
        logger.info(`Triggering risk alert: ${message}`);
        this.eventEmitter.emit('riskAlert', message);
    }
}

export const riskAlerting = new RiskAlerting();

// Example usage:
// riskAlerting.onRiskAlert((message) => console.log('Received risk alert:', message));
// riskAlerting.triggerRiskAlert('High risk position detected!');
