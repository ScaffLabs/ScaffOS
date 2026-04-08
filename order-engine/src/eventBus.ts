// eventBus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const emitOrderEvent = (event: any) => {
    eventBus.emit(event.type, event);
};

export const subscribeToOrderEvents = (eventType: string, listener: (event: any) => void) => {
    eventBus.on(eventType, listener);
};

// Retry Logic for Event Emission
export const emitWithRetry = async (event: any, retries: number = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            emitOrderEvent(event);
            return;
        } catch (error) {
            console.error(`Failed to emit event: ${error.message}`);
            if (i === retries - 1) throw error;
        }
    }
};
