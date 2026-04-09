import WebSocket from 'ws';
import { PriceData, PriceEvent } from './types';
import { postHttpClient, checkHealth } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError } from './errors';

export class PriceAggregator {
    private currentPrices: { [key: string]: number } = {};
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

    public async getPrices({ limit = 10, offset = 0, sort = 'exchange', order = 'asc' }): Promise<PriceData[]> {
        let prices = await storage.findAll();
        prices = this.sortPrices(prices, sort, order);
        return prices.slice(offset, offset + limit);
    }

    public async updatePrice(exchange: string, priceData: Partial<PriceData>): Promise<PriceData | null> {
        const existingPrice = await storage.findAll({ exchange });
        if (!existingPrice) return null;
        const updatedPrice = { ...existingPrice, ...priceData } as PriceData;
        await storage.update(exchange, updatedPrice);
        return updatedPrice;
    }

    public async deletePrice(exchange: string): Promise<boolean> {
        const existingPrice = await storage.findAll({ exchange });
        if (!existingPrice) return false;
        await storage.delete(existingPrice.id);
        return true;
    }

    private sortPrices(prices: PriceData[], sort: string, order: string): PriceData[] {
        return prices.sort((a, b) => {
            if (order === 'asc') {
                return a[sort] > b[sort] ? 1 : -1;
            } else {
                return a[sort] < b[sort] ? 1 : -1;
            }
        });
    }

    // Other methods remain unchanged...
}