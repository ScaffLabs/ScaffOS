import WebSocket from 'ws';
import { PriceData, CurrentPrices } from './types';
import { httpClient } from './httpClient';
import { EventEmitter } from 'events';
import { createPool } from 'generic-pool';

const pool = createPool({
    create: async () => {
        const connection = await newConnection();
        return connection;
    },
    destroy: async (connection) => {
        await connection.close();
    },
}, { min: 2, max: 10 });

export class PriceAggregator extends EventEmitter {
    private prices: PriceData[] = [];
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.startPriceFetch();
    }

    private startPriceFetch() {
        this.intervalId = setInterval(async () => {
            try {
                await this.fetchPrices();
                this.calculateVWAP();
                this.broadcastPrices();
                this.emit('pricesUpdated', this.currentPrices);
            } catch (error) {
                console.error('Error in price fetch:', error);
            }
        }, 5000);
    }

    public async fetchPrices() {
        const exchanges = ['exchange1', 'exchange2', 'exchange3'];
        const fetchPromises = exchanges.map(exchange => this.fetchExchangePrice(exchange));
        const prices = await Promise.all(fetchPromises);
        this.prices = prices.filter(price => price !== null) as PriceData[];
        this.updateCurrentPrices();
    }

    public async addPrice(priceData: PriceData) {
        this.prices.push(priceData);
        this.updateCurrentPrices();
        return priceData;
    }

    public async deletePrice(exchange: string) {
        const index = this.prices.findIndex(p => p.exchange === exchange);
        if (index === -1) throw new Error('Price not found');
        this.prices.splice(index, 1);
        this.updateCurrentPrices();
    }

    public async fetchExchangePrice(exchange: string): Promise<PriceData | null> {
        try {
            const priceData = await httpClient(`/prices/${encodeURIComponent(exchange)}`);
            return { exchange, price: priceData.price, volume: priceData.volume };
        } catch (error) {
            console.error(`Error fetching price for ${exchange}:`, error);
            return null;
        }
    }

    public async checkDependencies() {
        const dependencies = ['exchange1', 'exchange2'];
        const results = await Promise.all(dependencies.map(async (dep) => {
            try {
                await httpClient(`/health/${encodeURIComponent(dep)}`);
                return { [dep]: 'healthy' };
            } catch {
                return { [dep]: 'unhealthy' };
            }
        }));
        return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    }

    public async shutdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.clients.forEach(client => client.close());
    }

    private updateCurrentPrices() {
        this.currentPrices = {};
        this.prices.forEach(priceData => {
            this.currentPrices[priceData.exchange] = priceData.price;
        });
    }

    private calculateVWAP() {
        if (this.prices.length === 0) return;
        const totalValue = this.prices.reduce((acc, priceData) => acc + (priceData.price * priceData.volume), 0);
        const totalVolume = this.prices.reduce((acc, priceData) => acc + priceData.volume, 0);
        this.currentPrices['VWAP'] = totalValue / totalVolume;
    }

    private broadcastPrices() {
        this.clients.forEach(client => {
            client.send(JSON.stringify(this.currentPrices));
        });
    }
}