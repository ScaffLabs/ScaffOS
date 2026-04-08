import WebSocket from 'ws';
import { PriceData, CurrentPrices } from './types';
import { httpClient } from './httpClient';
import { storage } from './storage';
import { logError } from './logger';

const CONNECTION_POOL_LIMIT = 5;
const connectionPool: WebSocket[] = [];

export class PriceAggregator extends EventEmitter {
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    constructor() {
        super();
        this.startPriceFetch();
    }

    private createWebSocketConnection(url: string) {
        const ws = new WebSocket(url);
        connectionPool.push(ws);
        ws.on('close', () => {
            const index = connectionPool.indexOf(ws);
            if (index !== -1) connectionPool.splice(index, 1);
        });
        return ws;
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