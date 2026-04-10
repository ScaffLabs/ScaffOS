import { EventEmitter } from 'events';
import { PriceEvent } from './types';

/**
 * EventBus class handles the emission and listening of events related to price updates.
 * This class extends Node's EventEmitter.
 */
export class EventBus extends EventEmitter {
    /**
     * Emits a PRICE_ADDED event with specific price data.
     * @param priceData - The price data to include in the event.
     */
    public emitPriceAdded(priceData: PriceEvent['data']) {
        this.emit('PRICE_ADDED', { type: 'PRICE_ADDED', data: priceData });
    }

    /**
     * Listens for PRICE_ADDED events.
     * @param listener - The function to call when the event is emitted.
     */
    public onPriceAdded(listener: (event: PriceEvent) => void) {
        this.on('PRICE_ADDED', listener);
    }

    /**
     * Emits a PRICE_UPDATED event with specific price data.
     * @param priceData - The updated price data to include in the event.
     */
    public emitPriceUpdated(priceData: PriceEvent['data']) {
        this.emit('PRICE_UPDATED', { type: 'PRICE_UPDATED', data: priceData });
    }

    /**
     * Listens for PRICE_UPDATED events.
     * @param listener - The function to call when the event is emitted.
     */
    public onPriceUpdated(listener: (event: PriceEvent) => void) {
        this.on('PRICE_UPDATED', listener);
    }

    /**
     * Emits a PRICE_DELETED event indicating which price entry was deleted.
     * @param exchange - The exchange from which the price was deleted.
     */
    public emitPriceDeleted(exchange: string) {
        this.emit('PRICE_DELETED', { type: 'PRICE_DELETED', exchange });
    }

    /**
     * Listens for PRICE_DELETED events.
     * @param listener - The function to call when the event is emitted.
     */
    public onPriceDeleted(listener: (event: PriceEvent) => void) {
        this.on('PRICE_DELETED', listener);
    }
}