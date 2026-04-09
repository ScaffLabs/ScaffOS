import { EventEmitter } from 'events';
import { z } from 'zod';
import { AnalyticsEvent } from '../types';

const eventBus = new EventEmitter();
eventBus.setMaxListeners(20);

/**
 * Emit an event to the event bus.
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
export const subscribeToEvent = (event: AnalyticsEvent['type'], listener: (data: any) => void) => {
    eventBus.on(event, listener);
};

/**
 * Unsubscribe from an event on the event bus.
 * @param event - The event type.
 * @param listener - The listener callback function.
 */
export const unsubscribeFromEvent = (event: AnalyticsEvent['type'], listener: (data: any) => void) => {
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
            return z.object({
                drawdown: z.array(z.number()).nonempty(),
                maxDrawdown: z.number().nonnegative(),
                sharpeRatio: z.number(),
            });
        case 'STRATEGY_COMPARISON_RESULT':
            return z.object({
                betterStrategy: z.string().min(1),
            });
        default:
            throw new Error('Unknown event type');
    }
};