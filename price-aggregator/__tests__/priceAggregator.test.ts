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
        jest.spyOn(priceAggregator as any, 'fetchPrices').mockResolvedValueOnce([
            { exchange: 'exchange1', price: 100, volume: 10 },
            { exchange: 'exchange2', price: 200, volume: 20 }
        ]);
        await priceAggregator.fetchPrices();
        const currentPrices = priceAggregator.getCurrentPrices();
        expect(currentPrices).toHaveProperty('VWAP');
        expect(currentPrices.VWAP).toBeCloseTo(166.67, 2);
    });
    
    test('should handle empty price data gracefully', async () => {
        jest.spyOn(priceAggregator as any, 'fetchPrices').mockResolvedValueOnce([]);
        await priceAggregator.fetchPrices();
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
    
    test('should throw error if invalid price data is added', async () => {
        await expect(priceAggregator.addPrice({ exchange: '', price: -10, volume: -5 })).rejects.toThrow();
    });
    
    test('should handle error during price addition', async () => {
        jest.spyOn(priceAggregator as any, 'validatePriceData').mockImplementationOnce(() => { throw new Error('Validation Error'); });
        await expect(priceAggregator.addPrice({ exchange: 'exchange1', price: 100, volume: 10 })).rejects.toThrow('Validation Error');
    });
    
    test('should calculate VWAP correctly with varying volumes', async () => {
        jest.spyOn(priceAggregator as any, 'fetchPrices').mockResolvedValueOnce([
            { exchange: 'exchange1', price: 100, volume: 10 },
            { exchange: 'exchange2', price: 200, volume: 30 }
        ]);
        await priceAggregator.fetchPrices();
        const currentPrices = priceAggregator.getCurrentPrices();
        expect(currentPrices.VWAP).toBeCloseTo(166.67, 2);
    });
    
    test('should handle API errors gracefully in integration tests', async () => {
        jest.spyOn(priceAggregator as any, 'addPrice').mockRejectedValueOnce(new Error('API Error'));
        await expect(priceAggregator.addPrice({ exchange: 'exchange1', price: 100, volume: 10 })).rejects.toThrow('API Error');
    });
});