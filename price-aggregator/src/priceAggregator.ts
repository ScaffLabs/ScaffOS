import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema, PriceEvent } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { EventBus } from './eventBus';
import { ServiceError, ValidationError, OverflowError, DivisionByZeroError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        this.validatePriceData(priceData);
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

    private validatePriceData(priceData: PriceData): void {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
        this.checkForOverflow(priceData);
    }

    private checkForOverflow(priceData: PriceData): void {
        const { price, volume } = priceData;
        if (price > Number.MAX_SAFE_INTEGER || volume > Number.MAX_SAFE_INTEGER) {
            throw new OverflowError('Price or volume exceeds maximum safe integer value.');
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        this.currentPrices = await storage.findAll();
    }

    public async fetchPrices(): Promise<void> {
        try {
            const prices = await httpClient('/prices');
            this.currentPrices = prices;
        } catch (error) {
            logError(error, 'Failed to fetch prices');
            throw new ServiceError('Could not fetch prices from the external service.');
        }
    }

    private handlePriceEvent(event: PriceEvent): void {
        // Handle price events, such as broadcasting to connected clients
        this.broadcastPriceUpdate(event.data);
    }

    private broadcastPriceUpdate(priceData: PriceData): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(priceData));
            }
        });
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    public async checkDependencies(): Promise<{ [key: string]: string }> {
        const healthStatus: { [key: string]: string } = {};
        try {
            await httpClient('/health');
            healthStatus['priceService'] = 'healthy';
        } catch (error) {
            healthStatus['priceService'] = 'unhealthy';
            logError(error, 'Price service dependency is unhealthy');
        }
        return healthStatus;
    }
}