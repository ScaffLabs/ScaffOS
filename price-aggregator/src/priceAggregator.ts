import WebSocket from 'ws';
import { PriceData, CurrentPrices, PriceEvent, PriceDataSchema } from './types';
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
        this.eventBus.on('PRICE_ADDED', (event: PriceEvent) => this.handlePriceEvent(event));
        this.fetchPricesFromExchanges();
    }

    private async fetchPricesFromExchanges() {
        try {
            const exchanges = ['exchange1', 'exchange2'];
            const promises = exchanges.map(async (exchange) => {
                const priceData = await httpClient(`/prices/${exchange}`);
                return this.addPrice(priceData);
            });
            await Promise.all(promises);
        } catch (error) {
            logError(error, 'Error fetching prices from exchanges');
            throw new ServiceError('Failed to fetch prices from exchanges.');
        }
    }

    public async addPrice(priceData: PriceData): Promise<PriceData> {
        const validation = PriceDataSchema.safeParse(priceData);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }

        try {
            const newPrice = await storage.create(priceData);
            await this.updateCurrentPrices();
            this.eventBus.emitPriceAdded(newPrice);
            return newPrice;
        } catch (error) {
            logError(error, 'Error adding price data');
            throw new ServiceError('Failed to add price.');
        }
    }

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

    private async updateCurrentPrices(): Promise<void> {
        await this.getCurrentPrices();
    }

    private handlePriceEvent(event: PriceEvent): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(event.data));
            }
        });
    }

    public async checkDependencies(): Promise<Record<string, string>> {
        try {
            const healthChecks = await Promise.all([
                httpClient('/health/exchange1'),
                httpClient('/health/exchange2')
            ]);
            return {
                exchange1: healthChecks[0].status,
                exchange2: healthChecks[1].status,
            };
        } catch (error) {
            logError(error, 'Health check failed');
            throw new ServiceError('Dependencies are unhealthy.');
        }
    }
}