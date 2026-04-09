import WebSocket from 'ws';
import { PriceData, PriceEvent } from './types';
import { postHttpClient, checkHealth } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError, DivisionByZeroError } from './errors';

export class PriceAggregator {
    private currentPrices: { [key: string]: number } = {};
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
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    public async checkDependencies() {
        const healthChecks = await Promise.all([
            checkHealth(),
            httpClient('/another-external-service/health')
        ]);
        return healthChecks;
    }

    // Other methods remain unchanged...
}