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

    test('GET /prices should return 204 for no prices', async () => {
        (priceAggregator.getCurrentPrices as jest.Mock).mockReturnValueOnce({});
        const response = await request(app).get('/prices');
        expect(response.status).toBe(204);
    });

    test('GET /health should return healthy status', async () => {
        (priceAggregator.checkDependencies as jest.Mock).mockResolvedValueOnce({ database: 'healthy' });
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'healthy', dependencies: { database: 'healthy' }});
    });

    test('GET /health should return unhealthy status on error', async () => {
        (priceAggregator.checkDependencies as jest.Mock).mockRejectedValueOnce(new Error('Service down'));
        const response = await request(app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 'unhealthy', error: 'Service down' });
    });

    test('POST /prices should add new price', async () => {
        const newPriceData = { exchange: 'exchange1', price: 120, volume: 30 };
        (priceAggregator.addPrice as jest.Mock).mockResolvedValueOnce(newPriceData);
        const response = await request(app).post('/prices').send(newPriceData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newPriceData);
    });

    test('POST /prices should return 400 on invalid data', async () => {
        const invalidPriceData = { exchange: '', price: -50, volume: 0 };
        (priceAggregator.addPrice as jest.Mock).mockRejectedValueOnce(new Error('Validation Error'));
        const response = await request(app).post('/prices').send(invalidPriceData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Validation Error' });
    });

    test('POST /prices should return 400 on missing fields', async () => {
        const missingFieldData = { exchange: 'exchange1' }; // Missing price and volume
        const response = await request(app).post('/prices').send(missingFieldData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Price must be a positive number, Volume must be a positive number' });
    });

    test('POST /prices should handle API errors gracefully', async () => {
        const errorPriceData = { exchange: 'exchange1', price: 100, volume: 10 };
        (priceAggregator.addPrice as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
        const response = await request(app).post('/prices').send(errorPriceData);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'API Error' });
    });
});