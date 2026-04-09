import { EventEmitter } from 'events';
import logger from './logger';

export class RiskAlerting {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    onRiskAlert(callback: (message: string) => void) {
        this.eventEmitter.on('riskAlert', callback);
    }

    triggerRiskAlert(message: string) {
        logger.info(`Triggering risk alert: ${message}`);
        this.eventEmitter.emit('riskAlert', message);
    }
}