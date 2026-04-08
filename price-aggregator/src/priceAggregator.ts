import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema, PriceEvent } from './types';
import { httpClient, postHttpClient } from './httpClient';
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

    public async fetchExternalPrices(): Promise<void> {
        try {
            const prices = await httpClient('/external-prices');
            for (const priceData of prices) {
                await this.addPrice(priceData);
            }
        } catch (error) {
            logError(error, 'Failed to fetch external prices');
            throw new ServiceError('Could not fetch prices from external service.');
        }
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

    private validatePriceData(priceData: PriceData): void {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        const allPrices = await storage.findAll();
        this.currentPrices = {};
        let totalValue = 0;
        let totalVolume = 0;

        allPrices.forEach(price => {
            this.currentPrices[price.exchange] = price.price;
            totalValue += price.price * price.volume;
            totalVolume += price.volume;
        });

        this.currentPrices.VWAP = totalVolume ? totalValue / totalVolume : 0;
    }

    private handlePriceEvent(event: PriceEvent): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(event.data));
            }
        });
    }
}