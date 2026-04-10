import { EventEmitter } from 'events';
import { AppEvent } from '../types';
import winston from 'winston';

const eventBus = new EventEmitter();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

export const emitEvent = (event: string, data: any) => {
    logger.info(`Emitting event: ${event}`, { data });
    eventBus.emit(event, data);
};

export const subscribeToEvent = (event: string, listener: (data: any) => void) => {
    logger.info(`Subscribing to event: ${event}`);
    eventBus.on(event, listener);
};

export const unsubscribeFromEvent = (event: string, listener: (data: any) => void) => {
    logger.info(`Unsubscribing from event: ${event}`);
    eventBus.off(event, listener);
};

export const getEventBus = () => eventBus;

// Initialize listeners for events
subscribeToEvent('CONFIGURATION_DELETED', (data) => {
    logger.info('Configuration deleted:', data);
});

subscribeToEvent('CONFIGURATION_CREATED', (data) => {
    logger.info('Configuration created:', data);
});