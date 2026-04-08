import WebSocket from 'ws';
import { PriceData, CurrentPrices } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';

export class PriceAggregator extends EventEmitter {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    constructor() {
        super();
        this.startPriceFetch();
    }

    public async addPrice(priceData: PriceData) {
        const newPrice = await storage.create(priceData);
        await this.updateCurrentPrices();
        return newPrice;
    }

    public async deletePrice(exchange: string) {
        const prices = await storage.findAll({ exchange });
        if (prices.length === 0) throw new Error('Price not found');
        await Promise.all(prices.map(price => storage.delete(price.id))); // Assuming price has an id field
        await this.updateCurrentPrices();
    }

    private async updateCurrentPrices() {
        const prices = await storage.findAll();
        this.currentPrices = {};
        prices.forEach(priceData => {
            this.currentPrices[priceData.exchange] = priceData.price;
        });
    }
}