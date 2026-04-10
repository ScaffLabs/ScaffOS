import { EventEmitter } from 'events';
import { AppEvent, validateAppEvent } from '../types';
import winston from 'winston';

const eventBus = new EventEmitter();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

/**
 * Emit an event with data after validating it.
 * @param {AppEvent} event - The event to emit.
 */
export const emitEvent = (event: AppEvent) => {
    try {
        validateAppEvent(event);
        logger.info(`Emitting event: ${event.type}`, { data: event.payload });
        eventBus.emit(event.type, event.payload);
    } catch (error) {
        logger.error(`Failed to emit event: ${error.message}`);
    }
};

/**
 * Subscribe to a specific event.
 * @param {string} event - The event name to subscribe to.
 * @param {(data: any) => void} listener - The listener function.
 */
export const subscribeToEvent = (event: string, listener: (data: any) => void) => {
    logger.info(`Subscribing to event: ${event}`);
    eventBus.on(event, listener);
};

/**
 * Unsubscribe from a specific event.
 * @param {string} event - The event name to unsubscribe from.
 * @param {(data: any) => void} listener - The listener function.
 */
export const unsubscribeFromEvent = (event: string, listener: (data: any) => void) => {
    logger.info(`Unsubscribing from event: ${event}`);
    eventBus.off(event, listener);
};

// Initialize listeners for events
subscribeToEvent('CONFIGURATION_DELETED', (data) => {
    logger.info('Configuration deleted:', data);
});

subscribeToEvent('CONFIGURATION_CREATED', (data) => {
    logger.info('Configuration created:', data);
});