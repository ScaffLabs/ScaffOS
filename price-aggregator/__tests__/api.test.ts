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
        (priceAggregator.getCurrentPrices as jest.Mock).mockResolvedValueOnce([{ exchange: 'exchange1', price: 50, volume: 10 }]);
        const response = await request(app).get('/prices');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ exchange: 'exchange1', price: 50, volume: 10 }]);
    });

    test('GET /prices should return 204 for no prices', async () => {
        (priceAggregator.getCurrentPrices as jest.Mock).mockResolvedValueOnce([]);
        const response = await request(app).get('/prices');
        expect(response.status).toBe(204);
    });

    test('GET /health should return healthy status', async () => {
        const mockHealth = { database: 'healthy' };
        (priceAggregator.checkDependenciesHealth as jest.Mock).mockResolvedValueOnce(mockHealth);
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'healthy', dependencies: mockHealth });
    });

    test('POST /prices should add new price', async () => {
        const newPriceData = { exchange: 'exchange1', price: 120, volume: 30 };
        (priceAggregator.addPrice as jest.Mock).mockResolvedValueOnce(newPriceData);
        const response = await request(app).post('/prices').send(newPriceData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newPriceData);
    });

    test('POST /prices should return 400 for invalid data', async () => {
        const invalidPriceData = { exchange: '', price: -50, volume: 0 };
        (priceAggregator.addPrice as jest.Mock).mockRejectedValueOnce(new Error('Validation Error'));
        const response = await request(app).post('/prices').send(invalidPriceData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Validation Error' });
    });

    test('DELETE /prices/:id should return 204 on successful deletion', async () => {
        (priceAggregator.deletePrice as jest.Mock).mockResolvedValueOnce(undefined);
        const response = await request(app).delete('/prices/1');
        expect(response.status).toBe(204);
    });

    test('DELETE /prices/:id should return 404 if price not found', async () => {
        (priceAggregator.deletePrice as jest.Mock).mockRejectedValueOnce(new Error('Not Found'));
        const response = await request(app).delete('/prices/1');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not Found' });
    });

    test('POST /prices should return 500 on server error', async () => {
        const newPriceData = { exchange: 'exchange1', price: 150, volume: 20 };
        (priceAggregator.addPrice as jest.Mock).mockRejectedValueOnce(new Error('Database Error'));
        const response = await request(app).post('/prices').send(newPriceData);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error', details: 'Database Error' });
    });

    test('GET /prices should handle unexpected errors gracefully', async () => {
        (priceAggregator.getCurrentPrices as jest.Mock).mockRejectedValueOnce(new Error('Unexpected Error'));
        const response = await request(app).get('/prices');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error', details: 'Unexpected Error' });
    });
});