import WebSocket from 'ws';
import axios from 'axios';
import { PriceData, CurrentPrices } from './types';
import { httpClient } from './httpClient';
import { validationResult } from 'express-validator';

export class PriceAggregator {
    private prices: PriceData[] = [];
    private currentPrices: CurrentPrices = {};
    private clients: WebSocket[] = [];

    constructor() {
        this.startPriceFetch();
    }

    private startPriceFetch() {
        setInterval(async () => {
            await this.fetchPrices();
            this.calculateVWAP();
            this.broadcastPrices();
        }, 5000);
    }

    public async fetchPrices() {
        const exchanges = ['exchange1', 'exchange2', 'exchange3'];
        const fetchPromises = exchanges.map(exchange => this.fetchExchangePrice(exchange));
        const prices = await Promise.all(fetchPromises);
        this.prices = prices.filter(price => price !== null) as PriceData[];
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

    private updateCurrentPrices() {
        this.currentPrices = {};
        this.prices.forEach(priceData => {
            this.currentPrices[priceData.exchange] = priceData.price;
        });
    }

    private calculateVWAP() {
        const totalValue = this.prices.reduce((acc, p) => acc + p.price * p.volume, 0);
        const totalVolume = this.prices.reduce((acc, p) => acc + p.volume, 0);
        const vwap = totalVolume > 0 ? totalValue / totalVolume : 0;
        this.currentPrices['VWAP'] = vwap;
    }

    public getCurrentPrices() {
        return this.currentPrices;
    }

    public subscribe(ws: WebSocket) {
        this.clients.push(ws);
        ws.on('close', () => this.unsubscribe(ws));
        ws.send(JSON.stringify(this.getCurrentPrices()));
    }

    private unsubscribe(ws: WebSocket) {
        this.clients = this.clients.filter(client => client !== ws);
    }

    private broadcastPrices() {
        const message = JSON.stringify(this.getCurrentPrices());
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
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
}