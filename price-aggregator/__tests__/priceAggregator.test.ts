import { PriceAggregator } from '../src/priceAggregator';
import WebSocket from 'ws';
import { CurrentPrices } from '../src/types';

const mockWebSocket = (url: string) => {
    const ws = new WebSocket(url);
    ws.send = jest.fn();
    return ws;
};

describe('PriceAggregator', () => {
    let priceAggregator: PriceAggregator;
    let mockWs: WebSocket;

    beforeEach(() => {
        priceAggregator = new PriceAggregator();
        mockWs = mockWebSocket('ws://localhost');
    });

    test('should initialize with empty prices', () => {
        expect(priceAggregator.getCurrentPrices()).toEqual({});
    });

    test('should fetch prices and calculate VWAP', async () => {
        const fetchPricesSpy = jest.spyOn(priceAggregator as any, 'fetchPrices');
        await priceAggregator.fetchPrices();

        expect(fetchPricesSpy).toHaveBeenCalled();
        expect(priceAggregator.getCurrentPrices()).toHaveProperty('VWAP');
    });

    test('should handle empty price data gracefully', async () => {
        priceAggregator['prices'] = [];
        await expect(priceAggregator['calculateVWAP']()).resolves.not.toThrow();
        expect(priceAggregator.getCurrentPrices()).toHaveProperty('VWAP', 0);
    });

    test('should subscribe and broadcast prices', () => {
        priceAggregator.subscribe(mockWs);
        expect(priceAggregator['clients']).toContain(mockWs);
        priceAggregator.broadcastPrices();
        expect(mockWs.send).toHaveBeenCalled();
    });

    test('should handle error in fetching price', async () => {
        jest.spyOn(priceAggregator as any, 'fetchExchangePrice').mockResolvedValueOnce(null);
        await priceAggregator.fetchPrices();
        expect(priceAggregator.getCurrentPrices()).toEqual({});
    });

    test('should check dependencies health', async () => {
        jest.spyOn(priceAggregator as any, 'checkDependencies').mockResolvedValueOnce({ exchange1: 'healthy', exchange2: 'unhealthy' });
        const health = await priceAggregator.checkDependencies();
        expect(health).toEqual({ exchange1: 'healthy', exchange2: 'unhealthy' });
    });

    test('should throw error if price not found during deletion', async () => {
        await expect(priceAggregator.deletePrice('nonexistent')).rejects.toThrow('Price not found');
    });
});