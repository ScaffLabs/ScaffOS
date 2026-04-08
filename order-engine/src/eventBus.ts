// eventBus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const emitOrderEvent = (event: any) => {
    eventBus.emit(event.type, event);
};

export const subscribeToOrderEvents = (eventType: string, listener: (event: any) => void) => {
    eventBus.on(eventType, listener);
};