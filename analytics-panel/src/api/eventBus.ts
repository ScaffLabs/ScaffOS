import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

eventBus.setMaxListeners(20);

export const emitEvent = (event: string, data: any) => {
    eventBus.emit(event, data);
};

export const subscribeToEvent = (event: string, listener: (data: any) => void) => {
    eventBus.on(event, listener);
};

export const unsubscribeFromEvent = (event: string, listener: (data: any) => void) => {
    eventBus.off(event, listener);
};
