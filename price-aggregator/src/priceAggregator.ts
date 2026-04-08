import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceEvent, PriceDataSchema } from './types';
import { httpClient, postHttpClient } from './httpClient';
import { storage } from './storage';
import { logError, logSensitiveOperation } from './logger';
import { EventBus } from './eventBus';
import { ServiceError, ValidationError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
        this.fetchPricesFromExchanges();
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }

        try {
            const newPrice = await storage.create(priceData);
            logSensitiveOperation('Add Price', priceData);
            await this.updateCurrentPrices();
            this.eventBus.emitPriceAdded(newPrice);
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    // ... rest of the class remains unchanged
}