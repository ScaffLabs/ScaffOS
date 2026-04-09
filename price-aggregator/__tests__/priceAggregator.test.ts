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
        await priceAggregator['calculateVWAP'](prices);
        const currentPrices = priceAggregator.getCurrentPrices();
        expect(currentPrices.VWAP).toBeCloseTo(166.67, 2);
    });

    test('should handle empty price data gracefully', async () => {
        const prices: PriceData[] = [];
        const currentPrices = priceAggregator['calculateVWAP'](prices);
        expect(currentPrices).toEqual({ VWAP: 0 });
    });

    test('should throw error during VWAP calculation if total volume is zero', async () => {
        const prices = [{ exchange: 'exchange1', price: 100, volume: 0 }];
        await expect(priceAggregator['calculateVWAP'](prices)).rejects.toThrow('Division by zero in VWAP calculation.');
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
});
