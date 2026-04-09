import request from 'supertest';
import app from '../src/server';
import { fetchChartData } from '../src/api/chartApi';
import { jest } from '@jest/globals';

jest.mock('../src/api/chartApi');

describe('Chart API Endpoints', () => {
    it('GET /api/chart should return chart data', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue([{ date: '2021-01-01', price: 100 }]);
        const response = await request(app).get('/api/chart');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ date: '2021-01-01', price: 100 }]);
    });

    it('GET /api/chart should return 500 on fetch error', async () => {
        (fetchChartData as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        const response = await request(app).get('/api/chart');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching chart data' });
    });

    it('GET /api/chart should return 400 for invalid data structure', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue({ invalid: true });
        const response = await request(app).get('/api/chart');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid data structure');
    });

    it('GET /api/chart should handle empty data gracefully', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue([]);
        const response = await request(app).get('/api/chart');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});