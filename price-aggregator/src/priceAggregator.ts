import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceEvent } from './types';
import { httpClient, postHttpClient } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
        this.fetchPricesFromExchanges();
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        try {
            const newPrice = await storage.create(priceData);
            this.eventBus.emitPriceAdded(newPrice);
            return newPrice;
        } catch (error) {
            throw new Error('Failed to add price.');
        }
    }

    private handlePriceEvent(event: PriceEvent) {
        // Handle price events (e.g., logging, additional processing)
        console.log('Price event:', event);
        this.broadcastPrices();
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
}