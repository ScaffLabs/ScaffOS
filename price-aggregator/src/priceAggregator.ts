import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { EventEmitter } from 'events';

export class PriceAggregator extends EventEmitter {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    constructor() {
        super();
        this.startPriceFetch();
    }

    private validatePriceData(priceData: PriceData): void {
        const result = PriceDataSchema.safeParse(priceData);
        if (!result.success) {
            throw new ValidationError(result.error.errors.map(e => e.message).join(', '));
        }
    }

    public async addPrice(priceData: PriceData) {
        this.validatePriceData(priceData);
        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    public async deletePrice(exchange: string) {
        const prices = await storage.findAll({ exchange });
        if (prices.length === 0) throw new NotFoundError('Price not found');
        await Promise.all(prices.map(price => storage.delete(price.id)));
        await this.updateCurrentPrices();
    }

    private async updateCurrentPrices() {
        try {
            const prices = await storage.findAll();
            if (!prices || prices.length === 0) {
                throw new ServiceError('No prices available for update.');
            }
            this.currentPrices = {};
            prices.forEach(priceData => {
                this.currentPrices[priceData.exchange] = priceData.price;
            });
        } catch (error) {
            logError(error, 'Error updating current prices');
            throw new ServiceError('Failed to update current prices.');
        }
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    private startPriceFetch() {
        // Fetch prices logic here.
    }
}