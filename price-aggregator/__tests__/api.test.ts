import request from 'supertest';
import { app } from '../src/index';
import { PriceAggregator } from '../src/priceAggregator';

jest.mock('../src/priceAggregator');

describe('API Endpoints', () => {
    let priceAggregator: PriceAggregator;

    beforeAll(() => {
        priceAggregator = new PriceAggregator();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /prices should return current prices', async () => {
        (priceAggregator.getCurrentPrices as jest.Mock).mockReturnValueOnce({ VWAP: 100, exchange1: 50 });
        const response = await request(app).get('/prices');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ VWAP: 100, exchange1: 50 });
    });

    test('GET /health should return healthy status', async () => {
        (priceAggregator.checkDependencies as jest.Mock).mockResolvedValueOnce({ exchange1: 'healthy' });
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'healthy', dependencies: { exchange1: 'healthy' }});
    });

    test('GET /health should return unhealthy status on error', async () => {
        (priceAggregator.checkDependencies as jest.Mock).mockRejectedValueOnce(new Error('Service down'));
        const response = await request(app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 'unhealthy', error: 'Service down' });
    });
});
