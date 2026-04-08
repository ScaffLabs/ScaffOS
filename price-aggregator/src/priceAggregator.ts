import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema, PriceEvent, PriceEventSchema } from './types';
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

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        this.validatePriceData(priceData);
        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            this.emit('PRICE_ADDED', newPrice);
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    public async fetchPricesFromExchanges(): Promise<void> {
        const exchangeUrls = ['/exchange1/prices', '/exchange2/prices'];
        const pricePromises = exchangeUrls.map(url => httpClient(url));
        try {
            const prices = await Promise.all(pricePromises);
            for (const priceData of prices) {
                if (priceData) {
                    await this.addPrice(priceData);
                }
            }
        } catch (error) {
            logError(error, 'Error fetching prices from exchanges');
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        try {
            const prices = await storage.findAll();
            this.currentPrices = prices.reduce((acc, priceData) => {
                acc[priceData.exchange] = priceData.price;
                return acc;
            }, {} as CurrentPrices);
            const vwap = this.calculateVWAP(prices);
            this.currentPrices.VWAP = vwap;
        } catch (error) {
            logError(error, 'Error updating current prices');
            throw new ServiceError('Failed to update current prices.');
        }
    }

    private calculateVWAP(prices: PriceData[]): number {
        const totalValue = prices.reduce((acc, { price, volume }) => acc + price * volume, 0);
        const totalVolume = prices.reduce((acc, { volume }) => acc + volume, 0);
        return totalVolume > 0 ? totalValue / totalVolume : 0;
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    private startPriceFetch() {
        setInterval(() => {
            this.fetchPricesFromExchanges();
        }, 30000); // Fetch every 30 seconds
    }
}