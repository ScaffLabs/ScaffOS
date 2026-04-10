import { PriceData, PriceEvent, CurrentPrices, PriceDataSchema, PriceEventSchema } from './types';
import { storage } from './storage';
import { EventBus } from './eventBus';
import { ValidationError, ServiceError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    /**
     * Adds a new price to the aggregator.
     * @param priceData - The price data to add, must match PriceData schema.
     * @returns The added price data.
     * @throws ValidationError if the data is invalid.
     * @throws ServiceError if an error occurs during the operation.
     */
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
                this.eventBus.emitPriceAdded(newPrice);
            });
            return parsedData.data;
        } catch (error) {
            throw new ServiceError('Failed to add price: ' + error.message);
        }
    }

    /**
     * Retrieves the current prices from the aggregator.
     * @returns The current prices as CurrentPrices object.
     */
    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    /**
     * Calculates the Volume Weighted Average Price (VWAP).
     * @returns The calculated VWAP as a number.
     * @throws Error if no volume is available.
     */
    private async calculateVWAP(): Promise<number> {
        const pricesData = await storage.findAll();
        const totalVolume = pricesData.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new Error('No volume available for VWAP calculation.');

        const vwap = pricesData.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return parseFloat(vwap.toFixed(2));
    }

    /**
     * Handles events when a price is added.
     * @param event - The price event to handle.
     */
    private handlePriceEvent(event: PriceEvent) {
        console.log('New price added:', event.data);
    }
}