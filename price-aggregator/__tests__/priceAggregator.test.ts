import { PriceAggregator } from '../src/priceAggregator';
import { ValidationError } from '../src/errors';
import { PriceData } from '../src/types';

describe('PriceAggregator', () => {
    let priceAggregator: PriceAggregator;

    beforeEach(() => {
        priceAggregator = new PriceAggregator();
    });

    test('should initialize with empty prices', () => {
        expect(priceAggregator.getCurrentPrices()).toEqual({});
    });

    test('should throw validation error for invalid price data', async () => {
        const invalidPrice: PriceData = { exchange: '', price: -10, volume: -5 };
        await expect(priceAggregator.addPrice(invalidPrice)).rejects.toThrow(ValidationError);
    });

    test('should correctly calculate VWAP', async () => {
        const prices = [
            { exchange: 'exchange1', price: 100, volume: 10 },
            { exchange: 'exchange2', price: 200, volume: 20 }
        ];
        await Promise.all(prices.map(price => priceAggregator.addPrice(price)));
        const vwap = await priceAggregator.calculateVWAP();
        expect(vwap).toBeCloseTo(166.67, 2);
    });

    test('should handle empty price data gracefully', async () => {
        await expect(priceAggregator.calculateVWAP([])).rejects.toThrow(ValidationError);
    });

    test('should throw error during VWAP calculation if total volume is zero', async () => {
        const prices = [{ exchange: 'exchange1', price: 100, volume: 0 }];
        await expect(priceAggregator.calculateVWAP(prices)).rejects.toThrow('No volume available for VWAP calculation.');
    });

    test('should successfully add a valid price', async () => {
        const price: PriceData = { exchange: 'exchange1', price: 100, volume: 10 };
        await expect(priceAggregator.addPrice(price)).resolves.toEqual(price);
    });

    test('should properly emit price added event', async () => {
        const price: PriceData = { exchange: 'exchange1', price: 100, volume: 10 };
        const eventSpy = jest.spyOn(priceAggregator['eventBus'], 'emitPriceAdded');
        await priceAggregator.addPrice(price);
        expect(eventSpy).toHaveBeenCalledWith(price);
    });

    test('should return current prices after adding a price', async () => {
        const price: PriceData = { exchange: 'exchange1', price: 100, volume: 10 };
        await priceAggregator.addPrice(price);
        expect(priceAggregator.getCurrentPrices()).toEqual({ VWAP: expect.any(Number), exchange1: 100 });
    });

    test('should handle unexpected errors gracefully', async () => {
        jest.spyOn(priceAggregator, 'addPrice').mockRejectedValueOnce(new Error('Unexpected Error'));
        const price: PriceData = { exchange: 'exchange1', price: 100, volume: 10 };
        await expect(priceAggregator.addPrice(price)).rejects.toThrow('Unexpected Error');
    });

    test('should return 400 for invalid price data on add', async () => {
        const invalidPrice: PriceData = { exchange: '', price: 0, volume: 0 };
        await expect(priceAggregator.addPrice(invalidPrice)).rejects.toThrow(ValidationError);
    });
});