import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema, PriceEvent } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { ServiceError, ValidationError, OverflowError } from './errors';
import { EventEmitter } from 'events';
import { EventBus } from './eventBus';

export class PriceAggregator extends EventEmitter {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        super();
        this.eventBus = eventBus;
        this.startPriceFetch();
        this.eventBus.on('PRICE_ADDED', (priceData: PriceData) => this.handlePriceAdded(priceData));
    }

    private validatePriceData(priceData: PriceData): void {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        this.validatePriceData(priceData);
        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            this.eventBus.emit('PRICE_ADDED', newPrice);
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        // Logic to update current prices based on storage data.
        this.currentPrices = await storage.findAll();
    }

    private handlePriceAdded(priceData: PriceData): void {
        // Logic for handling price added event
    }
}