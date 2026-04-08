import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

export const emitOrderEvent = (event: any) => {
    eventBus.emit(event.type, event);
};

export const subscribeToOrderEvents = (eventType: string, listener: (event: any) => void) => {
    eventBus.on(eventType, listener);
};

export const emitWithRetry = async (event: any, retries: number = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            emitOrderEvent(event);
            return;
        } catch (error) {
            lastError = error;
            console.error(`Failed to emit event: ${error.message}`);
        }
    }
    throw new Error(`Failed to emit event after ${retries} attempts: ${lastError.message}`);
};

export const onOrderCreated = (listener: (order: any) => void) => {
    eventBus.on('ORDER_CREATED', listener);
};

export const onOrderUpdated = (listener: (order: any) => void) => {
    eventBus.on('ORDER_UPDATED', listener);
};

export const onOrderDeleted = (listener: (id: string) => void) => {
    eventBus.on('ORDER_DELETED', listener);
};

export const clearEventListeners = (eventType: string) => {
    eventBus.removeAllListeners(eventType);
};

export const getEventListenersCount = (eventType: string) => {
    return eventBus.listenerCount(eventType);
};
