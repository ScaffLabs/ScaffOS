import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { ServiceError, ValidationError } from './errors';
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
        this.eventBus.on('PRICE_ADDED', (priceData) => this.handlePriceAdded(priceData));
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
            this.eventBus.emit('PRICE_ADDED', newPrice);
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    public async fetchPricesFromExchanges(): Promise<void> {
        const exchangeUrls = [
            '/exchange1/prices',
            '/exchange2/prices'
        ];
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
            // Calculate VWAP
            const totalVolume = prices.reduce((sum, p) => sum + p.volume, 0);
            const weightedPriceSum = prices.reduce((sum, p) => sum + (p.price * p.volume), 0);
            this.currentPrices['VWAP'] = totalVolume > 0 ? (weightedPriceSum / totalVolume) : 0;
        } catch (error) {
            logError(error, 'Error updating current prices');
            throw new ServiceError('Failed to update current prices.');
        }
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    private startPriceFetch() {
        setInterval(() => {
            this.fetchPricesFromExchanges();
        }, 30000); // Fetch every 30 seconds
    }

    private handlePriceAdded(priceData: PriceData) {
        this.emit('PRICE_ADDED', priceData);
        this.clients.forEach(client => {
            client.send(JSON.stringify(priceData));
        });
    }

    public subscribe(client: WebSocket) {
        this.clients.push(client);
        client.on('close', () => {
            this.clients = this.clients.filter(c => c !== client);
        });
    }
}