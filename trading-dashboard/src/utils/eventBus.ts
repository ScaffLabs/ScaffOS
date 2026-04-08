import { EventEmitter } from 'events';
import { TradingEvent, TradingEventSchema } from '../types';

const eventBus = new EventEmitter();

/**
 * Publishes an event to the event bus.
 * @param event - The event type.
 * @param data - The event data.
 * @throws Will throw an error if the event data fails validation.
 */
export const publishEvent = (event: TradingEvent['type'], data: TradingEvent) => {
    const validationResult = TradingEventSchema.safeParse(data);
    if (!validationResult.success) {
        throw new Error('Invalid event data');
    }
    eventBus.emit(event, validationResult.data);
};

/**
 * Subscribes to an event on the event bus.
 * @param event - The event type.
 * @param listener - The listener function to call when the event is emitted.
 */
export const subscribeToEvent = (event: TradingEvent['type'], listener: (data: TradingEvent) => void) => {
    eventBus.on(event, listener);
};

/**
 * Unsubscribes from an event on the event bus.
 * @param event - The event type.
 * @param listener - The listener function to remove.
 */
export const unsubscribeFromEvent = (event: TradingEvent['type'], listener: (data: TradingEvent) => void) => {
    eventBus.off(event, listener);
};