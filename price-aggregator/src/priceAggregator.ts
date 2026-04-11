import { PriceData, PriceEvent, CurrentPrices, PriceDataSchema } from './types';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError } from './errors';
import { httpClient, checkHealth } from './httpClient';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    /**
     * Adds a new price data entry to the storage and updates the current prices.
     * @param priceData - The price data to be added.
     * @returns The newly added price data.
     * @throws ValidationError if the price data is invalid.
     * @throws ServiceError if there is a problem with adding the price.
     */
    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const parsedData = PriceDataSchema.safeParse(priceData);
        if (!parsedData.success) {
            throw new ValidationError('Invalid price data: ' + parsedData.error.errors.map(e => e.message).join(', '));
        }
        try {
            const existingPrice = await storage.findAll({ exchange: parsedData.data.exchange });
            if (existingPrice.length) {
                throw new ServiceError('Price for this exchange already exists.');
            }
            await storage.transaction(async () => {
                const newPrice = await storage.create(parsedData.data);
                this.currentPrices[parsedData.data.exchange] = parsedData.data.price;
                this.currentPrices.VWAP = await this.calculateVWAP();
                this.eventBus.emitPriceAdded(newPrice);
                await httpClient('/another-service/price-update', { method: 'POST', data: newPrice });
            });
            return parsedData.data;
        } catch (error) {
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    /**
     * Checks the health of dependencies for the price aggregator service.
     * @returns A promise that resolves to the health status of dependencies.
     */
    public async checkDependenciesHealth(): Promise<any> {
        return await checkHealth();
    }

    /**
     * Calculates the Volume Weighted Average Price (VWAP) based on current prices.
     * @returns The calculated VWAP.
     * @throws ServiceError if no volume is available for calculation.
     */
    private async calculateVWAP(): Promise<number> {
        const pricesData = await storage.findAll();
        const totalVolume = pricesData.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new ServiceError('No volume available for VWAP calculation.');
        const vwap = pricesData.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return parseFloat(vwap.toFixed(2));
    }

    /**
     * Handles incoming price events from the event bus.
     * @param event - The price event containing data about the price change.
     */
    private handlePriceEvent(event: PriceEvent) {
        console.log('New price added:', event.data);
    }
}