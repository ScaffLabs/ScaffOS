import { PriceData, PriceEvent, CurrentPrices, PriceDataSchema } from './types';
import { postHttpClient, checkHealth } from './httpClient';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const parsedData = PriceDataSchema.safeParse(priceData);
        if (!parsedData.success) {
            throw new ValidationError('Invalid price data: ' + parsedData.error.errors.map(e => e.message).join(', '));
        }

        try {
            await storage.transaction(async () => {
                const newPrice = await storage.create(parsedData.data);
                this.currentPrices[parsedData.data.exchange] = parsedData.data.price;
                this.currentPrices.VWAP = await this.calculateVWAP();
                await postHttpClient('/prices', newPrice);
                this.eventBus.emitPriceAdded(newPrice);
            });
            return parsedData.data;
        } catch (error) {
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    public async checkDependencies() {
        try {
            const dbHealth = await checkHealth();
            return { database: dbHealth.status };
        } catch (error) {
            throw new ServiceError('Dependency health check failed: ' + error.message);
        }
    }

    private async calculateVWAP(): Promise<number> {
        const pricesData = await storage.findAll();
        const totalVolume = pricesData.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new ValidationError('No volume available for VWAP calculation.');

        const vwap = pricesData.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return parseFloat(vwap.toFixed(2));
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
}