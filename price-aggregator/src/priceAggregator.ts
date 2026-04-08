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
        // Listen for price added events and handle them accordingly.
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        // Validate the incoming price data before processing.
        this.validatePriceData(priceData);
        try {
            // Store the new price in the storage system and update current prices.
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            // Emit an event for the new price added for real-time updates.
            this.eventBus.emit('PRICE_ADDED', { type: 'PRICE_ADDED', data: newPrice });
            return newPrice;
        } catch (error) {
            // Log the error and throw a service error for the API response.
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

    public async fetchExternalPrices(): Promise<void> {
        try {
            // Fetch external prices and update the current prices.
            const prices = await httpClient('/external-prices');
            this.currentPrices = { ...this.currentPrices, ...prices };
        } catch (error) {
            // Log error if fetching prices fails and throw a service error.
            logError(error, 'Failed to fetch external prices');
            throw new ServiceError('Could not fetch prices from external service.');
        }
    }

    public async checkDependencies(): Promise<{ [key: string]: string }> {
        const healthStatus: { [key: string]: string } = {};
        try {
            // Check health of external services.
            await httpClient('/health');
            healthStatus['priceService'] = 'healthy';
        } catch (error) {
            // Log error and mark service as unhealthy.
            healthStatus['priceService'] = 'unhealthy';
            logError(error, 'Price service dependency is unhealthy');
        }
        return healthStatus;
    }

    private validatePriceData(priceData: PriceData): void {
        // Validate incoming price data against the defined schema.
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(JSON.stringify(validation.error.errors));
        }
    }

    private async updateCurrentPrices(): Promise<void> {
        // Update current prices from storage to reflect the latest data.
        this.currentPrices = await storage.findAll();
    }

    private handlePriceEvent(event: PriceEvent): void {
        // Broadcast new price data to all connected WebSocket clients.
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(event.data));
            }
        });
    }
}