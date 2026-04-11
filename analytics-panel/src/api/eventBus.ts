import { EventEmitter } from 'events';
import { AnalyticsEvent, AnalyticsEventSchema } from '../types';

const eventBus = new EventEmitter();
eventBus.setMaxListeners(20);

/**
 * Emit an event to the event bus with validation.
 * @param event - The event type.
 * @param data - The event data matching the AnalyticsEvent type.
 */
export const emitEvent = (event: AnalyticsEvent['type'], data: AnalyticsEvent['data']) => {
    const eventSchema = getEventSchema(event);
    eventSchema.parse(data);
    eventBus.emit(event, data);
};

/**
 * Subscribe to an event on the event bus.
 * @param event - The event type.
 * @param listener - The listener callback function.
 */
export const subscribeToEvent = (event: AnalyticsEvent['type'], listener: (data: AnalyticsEvent['data']) => void) => {
    eventBus.on(event, listener);
};

/**
 * Unsubscribe from an event on the event bus.
 * @param event - The event type.
 * @param listener - The listener callback function.
 */
export const unsubscribeFromEvent = (event: AnalyticsEvent['type'], listener: (data: AnalyticsEvent['data']) => void) => {
    eventBus.off(event, listener);
};

/**
 * Get the Zod schema for validating event data based on the event type.
 * @param event - The event type.
 * @returns Zod schema for the event data.
 */
const getEventSchema = (event: AnalyticsEvent['type']) => {
    switch (event) {
        case 'PERFORMANCE_METRICS_FETCHED':
            return AnalyticsEventSchema.shape.data;
        case 'STRATEGY_COMPARISON_RESULT':
            return AnalyticsEventSchema.shape.betterStrategy;
        default:
            throw new Error('Unknown event type');
    }
};

/**
 * Emit and subscribe example usages.
 */
// Emit an example event
emitEvent('PERFORMANCE_METRICS_FETCHED', { drawdown: [10, 20], maxDrawdown: 30, sharpeRatio: 1.5 });

// Subscribe to an example event
subscribeToEvent('PERFORMANCE_METRICS_FETCHED', (data) => {
    console.log('Performance metrics received:', data);
});
