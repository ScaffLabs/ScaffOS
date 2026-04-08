import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
    public emitPriceAdded(priceData: any) {
        this.emit('PRICE_ADDED', { type: 'PRICE_ADDED', data: priceData });
    }

    public onPriceAdded(listener: (event: any) => void) {
        this.on('PRICE_ADDED', listener);
    }

    // Additional methods can be added here for custom events if needed
}