import { EventEmitter } from 'events';
import { AppEvent } from '../types';

const eventBus = new EventEmitter();

export const emitEvent = (event: string, data: any) => {
    eventBus.emit(event, data);
};

export const subscribeToEvent = (event: string, listener: (data: any) => void) => {
    eventBus.on(event, listener);
};

export const unsubscribeFromEvent = (event: string, listener: (data: any) => void) => {
    eventBus.off(event, listener);
};

export const getEventBus = () => eventBus;

// Initialize listeners for events
subscribeToEvent('CONFIGURATION_DELETED', (data) => {
    console.log('Configuration deleted:', data);
});

subscribeToEvent('CONFIGURATION_CREATED', (data) => {
    console.log('Configuration created:', data);
});