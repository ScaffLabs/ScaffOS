import { PriceData, PriceEvent, CurrentPrices, PriceDataSchema } from './types';
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
     * Adds a new price to the aggregator and updates current prices and VWAP.
     * @param priceData - The price data to add.
     * @returns The added price data.
     * @throws ValidationError if the price data is invalid.
     * @throws ServiceError if the addition fails.
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
     * Retrieves current prices from the storage, with optional filtering and sorting.
     * @param options - Options for limiting, offsetting, sorting, and filtering by exchange.
     * @returns An array of current prices.
     */
    public async getCurrentPrices({ limit, offset, sort, exchange }: { limit: number; offset: number; sort: string; exchange?: string }): Promise<CurrentPrices[]> {
        const pricesData = await storage.findAll();
        let filteredPrices = pricesData;
        if (exchange) {
            filteredPrices = filteredPrices.filter(price => price.exchange === exchange);
        }
        if (sort === 'desc') {
            filteredPrices.sort((a, b) => b.price - a.price);
        } else {
            filteredPrices.sort((a, b) => a.price - b.price);
        }
        return filteredPrices.slice(offset, offset + limit);
    }

    /**
     * Updates a price in the storage.
     * @param id - The ID of the price to update.
     * @param priceData - The new price data.
     * @returns The updated price data or null if not found.
     */
    public async updatePrice(id: string, priceData: PriceData): Promise<PriceData | null> {
        const existingPrice = await storage.read(id);
        if (!existingPrice) return null;
        const updatedPrice = { ...existingPrice, ...priceData };
        await storage.update(id, updatedPrice);
        return updatedPrice;
    }

    /**
     * Deletes a price from the storage.
     * @param id - The ID of the price to delete.
     */
    public async deletePrice(id: string): Promise<void> {
        await storage.delete(id);
    }

    /**
     * Calculates the Volume Weighted Average Price (VWAP) from the stored prices.
     * @returns The calculated VWAP.
     * @throws Error if no volume is available for calculation.
     */
    private async calculateVWAP(): Promise<number> {
        const pricesData = await storage.findAll();
        const totalVolume = pricesData.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new Error('No volume available for VWAP calculation.');
        const vwap = pricesData.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return parseFloat(vwap.toFixed(2));
    }

    /**
     * Handles price events emitted by the event bus.
     * @param event - The price event to handle.
     */
    private handlePriceEvent(event: PriceEvent) {
        console.log('New price added:', event.data);
    }
}