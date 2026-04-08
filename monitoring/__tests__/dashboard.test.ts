import request from 'supertest';
import express from 'express';
import { dashboard } from '../dashboard';
import errorMiddleware from '../errorMiddleware';
import { ServiceError } from '../errorClasses';

const app = express();
app.get('/dashboard', dashboard);
app.use(errorMiddleware);

describe('Dashboard Endpoint', () => {
    it('should return aggregated data', async () => {
        // Mock the getAggregatedData function
        jest.spyOn(require('../dataAggregator'), 'getAggregatedData').mockResolvedValue([{ id: '1', value: 100 }]);

        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', value: 100 }]);
    });

    it('should handle no data available', async () => {
        jest.spyOn(require('../dataAggregator'), 'getAggregatedData').mockResolvedValue([]);

        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('No data available');
    });

    it('should handle internal server error', async () => {
        jest.spyOn(require('../dataAggregator'), 'getAggregatedData').mockRejectedValue(new Error('Internal Error'));

        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});
