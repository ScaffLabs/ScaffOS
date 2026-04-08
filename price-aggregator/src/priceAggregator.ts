import WebSocket from 'ws';
import { PriceData, CurrentPrices } from './types';
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
        if (!priceData.exchange || !priceData.price || !priceData.volume) {
            throw new ValidationError('Invalid price data. Exchange, price and volume are required.');
        }
        if (typeof priceData.price !== 'number' || typeof priceData.volume !== 'number') {
            throw new ValidationError('Price and volume must be numbers.');
        }
    }

    public async addPrice(priceData: PriceData) {
        this.validatePriceData(priceData);
        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            return newPrice;
        } catch (error) {
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
        const prices = await storage.findAll();
        this.currentPrices = {};
        prices.forEach(priceData => {
            this.currentPrices[priceData.exchange] = priceData.price;
        });
    }
}