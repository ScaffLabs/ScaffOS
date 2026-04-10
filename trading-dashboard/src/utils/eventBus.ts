import { EventEmitter } from 'events';
import { TradingEvent, TradingEventSchema } from '../types';

const eventBus = new EventEmitter();

export const publishEvent = (event: TradingEvent['type'], data: TradingEvent) => {
    const validationResult = TradingEventSchema.safeParse(data);
    if (!validationResult.success) {
        throw new Error('Invalid event data');
    }
    eventBus.emit(event, validationResult.data);
};

export const subscribeToEvent = (event: TradingEvent['type'], listener: (data: TradingEvent) => void) => {
    eventBus.on(event, listener);
};

export const unsubscribeFromEvent = (event: TradingEvent['type'], listener: (data: TradingEvent) => void) => {
    eventBus.off(event, listener);
};

export const notifyEventSubscribers = (event: TradingEvent['type'], data: TradingEvent) => {
    eventBus.emit(event, data);
};

export const getEventBusInstance = () => eventBus;

export const initializeEventBus = () => {
    // Default subscriptions can be added here if required
    subscribeToEvent('ORDER_SUBMITTED', (data) => {
        console.log('Order Submitted Event:', data);
    });
};

initializeEventBus();

export const reconnectEventBus = () => {
    // Reconnect logic to handle any disconnections
    console.log('Reconnecting Event Bus...');
    // You can add logic to attempt reconnection or reset listeners if needed
};

// Handle error events
eventBus.on('error', (error) => {
    console.error('Event Bus Error:', error);
    reconnectEventBus();
});