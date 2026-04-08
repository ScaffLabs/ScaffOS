import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceEvent, PriceDataSchema } from './types';
import { httpClient } from './httpClient';
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

    /**
     * Adds a new price data entry to the system.
     * @param priceData - The price data to be added.
     * @returns The newly added price data with an ID.
     * @throws ValidationError if the priceData is invalid.
     * @throws ServiceError if there is an issue adding the price data.
     */
    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }

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
     * Retrieves the current prices and calculates VWAP.
     * @returns An object containing the current prices and VWAP.
     */
    public async getCurrentPrices(): Promise<CurrentPrices> {
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
        return this.currentPrices;
    }

    /**
     * Updates the current prices based on the latest data in storage.
     */
    private async updateCurrentPrices(): Promise<void> {
        await this.getCurrentPrices();
    }

    /**
     * Handles price events and broadcasts them to connected clients.
     * @param event - The price event to handle.
     */
    private handlePriceEvent(event: PriceEvent): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(event.data));
            }
        });
    }
}