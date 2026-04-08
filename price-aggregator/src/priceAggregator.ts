import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { ServiceError, ValidationError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    public async addPrice(priceData: PriceData): Promise<PriceData> {
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

    private validatePriceData(priceData: PriceData): void {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        this.currentPrices = await storage.findAll();
    }

    public async fetchPrices(): Promise<void> {
        try {
            const prices = await httpClient('/prices');
            this.currentPrices = prices;
        } catch (error) {
            logError(error, 'Failed to fetch prices');
            throw new ServiceError('Could not fetch prices from the external service.');
        }
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }
}