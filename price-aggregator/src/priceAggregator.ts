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

    public async fetchPricesFromExchanges(): Promise<void> {
        try {
            const prices = await httpClient('/prices');
            this.currentPrices = this.calculateVWAP(prices);
        } catch (error) {
            logError(error, 'Error fetching prices from exchanges');
            throw new ServiceError('Failed to fetch prices.');
        }
    }

    private calculateVWAP(prices: PriceData[]): CurrentPrices {
        if (!prices || prices.length === 0) return { VWAP: 0 }; // Handle empty array

        const totalVolume = prices.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new Error('Division by zero in VWAP calculation.');

        const vwap = prices.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return { VWAP: vwap, ...prices.reduce((acc, price) => ({ ...acc, [price.exchange]: price.price }), {}) };
    }

    private async updateCurrentPrices() {
        const prices = await storage.findAll();
        this.currentPrices = this.calculateVWAP(prices);
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    public subscribe(client: WebSocket) {
        this.clients.push(client);
        client.on('close', () => this.unsubscribe(client));
        this.broadcastPrices();
    }

    private unsubscribe(client: WebSocket) {
        this.clients = this.clients.filter(c => c !== client);
    }

    private broadcastPrices() {
        const message = JSON.stringify(this.currentPrices);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    private handlePriceEvent(event: PriceEvent) {
        // Handle price events (e.g., logging, additional processing)
        console.log('Price event:', event);
        this.broadcastPrices();
    }
}