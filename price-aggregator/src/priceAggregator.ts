import { PriceData, PriceEvent } from './types';
import { postHttpClient, checkHealth } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError } from './errors';

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
        try {
            const dbHealth = await checkHealth();
            return { database: dbHealth.status };
        } catch (error) {
            throw new ServiceError('Dependency health check failed: ' + error.message);
        }
    }

    private handlePriceEvent(event: PriceEvent) {
        switch (event.type) {
            case 'PRICE_ADDED':
                console.log('New price added:', event.data);
                break;
            case 'PRICE_UPDATED':
                console.log('Price updated:', event.data);
                break;
            case 'PRICE_DELETED':
                console.log('Price deleted for exchange:', event.exchange);
                break;
        }
    }

    private validatePriceData(priceData: PriceData): boolean {
        return priceData.exchange.trim() !== '' && priceData.price > 0 && priceData.volume > 0;
    }
}