import WebSocket from 'ws';
import { PriceData, PriceEvent } from './types';
import { postHttpClient } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError, DivisionByZeroError } from './errors';

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
            if (error instanceof DivisionByZeroError) {
                throw new ServiceError('Division by zero error in price addition.');
            }
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    private validatePriceData(priceData: PriceData): boolean {
        if (!priceData.exchange || priceData.price <= 0 || priceData.volume <= 0) {
            return false;
        }
        return true;
    }

    private handlePriceEvent(event: PriceEvent) {
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