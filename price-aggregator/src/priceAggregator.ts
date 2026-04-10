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
     * Adds a new price entry to the aggregator.
     * @param priceData - The price data to be added.
     * @returns The added PriceData.
     * @throws ValidationError if the priceData is invalid.
     * @throws ServiceError if the storage operation fails.
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
     * Retrieves current prices based on optional filters and pagination.
     * @param options - Options for limit, offset, sort, and exchange filtering.
     * @returns A list of current prices.
     */
    public async getCurrentPrices({ limit = 10, offset = 0, sort = 'asc', exchange }: { limit?: number; offset?: number; sort?: 'asc' | 'desc'; exchange?: string }): Promise<CurrentPrices[]> {
        const pricesData = await storage.findAll();
        let filteredPrices = pricesData;
        if (exchange) {
            filteredPrices = filteredPrices.filter(price => price.exchange === exchange);
        }
        filteredPrices.sort((a, b) => {
            return sort === 'desc' ? b.price - a.price : a.price - b.price;
        });
        return filteredPrices.slice(offset, offset + limit);
    }

    /**
     * Deletes a price entry by ID.
     * @param id - The ID of the price to be deleted.
     * @throws ServiceError if the deletion fails.
     */
    public async deletePrice(id: string): Promise<void> {
        await storage.delete(id);
    }

    private async calculateVWAP(): Promise<number> {
        const pricesData = await storage.findAll();
        const totalVolume = pricesData.reduce((acc, price) => acc + price.volume, 0);
        if (totalVolume === 0) throw new Error('No volume available for VWAP calculation.');
        const vwap = pricesData.reduce((acc, price) => acc + (price.price * price.volume), 0) / totalVolume;
        return parseFloat(vwap.toFixed(2));
    }

    private handlePriceEvent(event: PriceEvent) {
        console.log('New price added:', event.data);
    }
}