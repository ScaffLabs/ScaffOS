import WebSocket from 'ws';
import { PriceData, CurrentPrices } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';
import { EventEmitter } from 'events';

const CONNECTION_POOL_LIMIT = 5;
const connectionPool: WebSocket[] = [];

export class PriceAggregator extends EventEmitter {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    constructor() {
        super();
        this.startPriceFetch();
    }

    private async checkServiceHealth(url: string): Promise<string> {
        try {
            const response = await httpClient(url);
            return response.status === 200 ? 'healthy' : 'unhealthy';
        } catch (error) {
            logError(error, 'Service Health Check');
            return 'unhealthy';
        }
    }

    public async checkDependencies(): Promise<{ [key: string]: string }> {
        const dependencies = {
            exchange1: await this.checkServiceHealth(process.env.EXCHANGE1_URL || ''),
            exchange2: await this.checkServiceHealth(process.env.EXCHANGE2_URL || ''),
        };
        return dependencies;
    }

    private async fetchPricesWithRetries(retries: number = 3): Promise<void> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const prices = await httpClient('/prices'); // Adjust path as necessary
                this.currentPrices = prices;
                return;
            } catch (error) {
                logError(error, 'Fetching prices');
                if (attempt < retries - 1) {
                    const backoffTime = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
        }
        throw new Error('Max retries reached for fetching prices.');
    }

    public async addPrice(priceData: PriceData) {
        const newPrice = await storage.create(priceData);
        await this.updateCurrentPrices();
        return newPrice;
    }

    public async deletePrice(exchange: string) {
        const prices = await storage.findAll({ exchange });
        if (prices.length === 0) throw new Error('Price not found');
        await Promise.all(prices.map(price => storage.delete(price.id)));
        await this.updateCurrentPrices();
    }

    private async updateCurrentPrices() {
        const prices = await storage.findAll();
        this.currentPrices = {};
        prices.forEach(priceData => {
            this.currentPrices[priceData.exchange] = priceData.price;
        });
    }
}