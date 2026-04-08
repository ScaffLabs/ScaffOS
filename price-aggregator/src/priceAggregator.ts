import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceEvent, PriceDataSchema } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { EventBus } from './eventBus';
import { ServiceError, ValidationError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }

        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            this.eventBus.emit('PRICE_ADDED', { type: 'PRICE_ADDED', data: newPrice });
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    public async getCurrentPrices(): Promise<CurrentPrices> {
        const allPrices = await storage.findAll();
        this.currentPrices = {};
        let totalValue = 0;
        let totalVolume = 0;

        allPrices.forEach(price => {
            this.currentPrices[price.exchange] = price.price;
            totalValue += price.price * price.volume;
            totalVolume += price.volume;
        });

        if (totalVolume === 0) {
            this.currentPrices.VWAP = 0;
        } else {
            this.currentPrices.VWAP = totalValue / totalVolume;
        }
        return this.currentPrices;
    }

    private async updateCurrentPrices(): Promise<void> {
        await this.getCurrentPrices();
    }

    private handlePriceEvent(event: PriceEvent): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(event.data));
            }
        });
    }
}