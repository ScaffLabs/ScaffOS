import WebSocket from 'ws';
import { PriceData, PriceEvent } from './types';
import { postHttpClient } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError, DivisionByZeroError } from './errors';
import { httpClient } from './httpClient';

export class PriceAggregator {
    private currentPrices: { [key: string]: number } = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        if (!this.validatePriceData(priceData)) {
            throw new ValidationError('Invalid price data.');
        }

        try {
            const newPrice = await storage.create(priceData);
            this.currentPrices[priceData.exchange] = priceData.price;
            await postHttpClient('/prices', newPrice);
            this.eventBus.emitPriceAdded(newPrice);
            return newPrice;
        } catch (error) {
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    private validatePriceData(priceData: PriceData): boolean {
        if (!priceData.exchange || priceData.price <= 0 || priceData.volume <= 0) {
            return false;
        }
        return true;
    }

    public async calculateVWAP(prices: PriceData[]): Promise<number> {
        if (prices.length === 0) throw new ValidationError('Price data cannot be empty.');
        const totalVolume = prices.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new DivisionByZeroError('Cannot calculate VWAP with zero total volume.');

        const weightedSum = prices.reduce((acc, price) => acc + (price.price * price.volume), 0);
        return weightedSum / totalVolume;
    }

    public async checkDependencies() {
        const healthChecks = await Promise.all([
            httpClient('/external-service/health'),
            httpClient('/another-external-service/health')
        ]);
        return healthChecks;
    }

    // Remaining methods ...
}