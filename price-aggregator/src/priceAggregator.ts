import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceDataSchema, PriceEvent } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { EventBus } from './eventBus';
import { ServiceError, ValidationError, OverflowError } from './errors';

export class PriceAggregator {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private eventBus = new EventBus();

    constructor() {
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    /**
     * Adds a new price entry to the storage and updates current prices.
     * @param priceData - The price data to add.
     * @returns The newly added price data.
     * @throws {ServiceError} If there is an error adding the price.
     */
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

    /**
     * Validates the price data against the schema.
     * @param priceData - The price data to validate.
     * @throws {ValidationError} If validation fails.
     */
    private validatePriceData(priceData: PriceData): void {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
        this.checkForOverflow(priceData);
    }

    /**
     * Checks if price or volume exceeds maximum safe integer value.
     * @param priceData - The price data to check.
     * @throws {OverflowError} If overflow is detected.
     */
    private checkForOverflow(priceData: PriceData): void {
        const { price, volume } = priceData;
        if (price > Number.MAX_SAFE_INTEGER || volume > Number.MAX_SAFE_INTEGER) {
            throw new OverflowError('Price or volume exceeds maximum safe integer value.');
        }
    }

    /**
     * Updates the current prices from storage.
     */
    private async updateCurrentPrices(): Promise<void> {
        this.currentPrices = await storage.findAll();
    }

    /**
     * Fetches the latest prices from the external service.
     * @throws {ServiceError} If fetching prices fails.
     */
    public async fetchPrices(): Promise<void> {
        try {
            const prices = await httpClient('/prices');
            this.currentPrices = prices;
        } catch (error) {
            logError(error, 'Failed to fetch prices');
            throw new ServiceError('Could not fetch prices from the external service.');
        }
    }

    /**
     * Handles price events emitted through the event bus.
     * @param event - The price event to handle.
     */
    private handlePriceEvent(event: PriceEvent): void {
        this.broadcastPriceUpdate(event.data);
    }

    /**
     * Broadcasts updated price data to all connected clients.
     * @param priceData - The price data to broadcast.
     */
    private broadcastPriceUpdate(priceData: PriceData): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(priceData));
            }
        });
    }

    /**
     * Gets the current prices.
     * @returns The current prices.
     */
    public getCurrentPrices(): CurrentPrices {
        return this.currentPrices;
    }

    /**
     * Checks the health status of dependencies.
     * @returns Health status of the dependencies.
     */
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