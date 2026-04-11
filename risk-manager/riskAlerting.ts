import { EventEmitter } from 'events';
import logger from './logger';
import { RiskEvent, RiskEventSchema } from './sharedTypes';

export class RiskAlerting {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Register a callback for risk alerts.
     * @param {function} callback - The callback function to trigger on risk alert.
     */
    onRiskAlert(callback: (event: RiskEvent) => void) {
        this.eventEmitter.on('riskAlert', callback);
        logger.info('Risk alert listener added.');
    }

    /**
     * Trigger a risk alert event.
     * @param {RiskEvent} event - The risk event to emit.
     */
    triggerRiskAlert(event: RiskEvent) {
        const validationResult = RiskEventSchema.safeParse(event);
        if (!validationResult.success) {
            logger.error(`Invalid risk event data: ${JSON.stringify(validationResult.error.errors)}`);
            return;
        }
        logger.info(`Triggering risk alert: ${JSON.stringify(event)}`);
        this.eventEmitter.emit('riskAlert', event);
    }
}

export const riskAlerting = new RiskAlerting(); 

// Example usage:
// riskAlerting.onRiskAlert((event) => console.log('Received risk alert:', event));
// riskAlerting.triggerRiskAlert({ type: 'RiskPositionCreated', position: {...} }); 
