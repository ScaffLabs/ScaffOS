import request from 'supertest';
import app from '../src/server';
import { fetchPositions, updatePosition, deletePosition, createPosition } from '../src/api/portfolioApi';
import { jest } from '@jest/globals';

jest.mock('../src/api/portfolioApi');

describe('API Endpoints', () => {
    it('GET /api/positions should return positions', async () => {
        (fetchPositions as jest.Mock).mockResolvedValue([{ id: 1, symbol: 'AAPL', quantity: 10 }]);
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, symbol: 'AAPL', quantity: 10 }]);
    });

    it('GET /api/positions should return 500 on fetch error', async () => {
        (fetchPositions as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching positions' });
    });

    it('POST /api/positions should create a position', async () => {
        (createPosition as jest.Mock).mockResolvedValue({ id: '2', symbol: 'GOOGL', quantity: 5 });
        const response = await request(app)
            .post('/api/positions')
            .send({ id: '2', symbol: 'GOOGL', quantity: 5 });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Position created successfully', position: { id: '2', symbol: 'GOOGL', quantity: 5 } });
    });

    it('PUT /api/positions/:id with valid data should update position', async () => {
        (updatePosition as jest.Mock).mockResolvedValue({});
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: 10 });
        expect(response.status).toBe(204);
    });

    it('PUT /api/positions/:id with invalid data should return 400', async () => {
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: -10 });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid quantity' });
    });

    it('DELETE /api/positions/:id should delete position', async () => {
        (deletePosition as jest.Mock).mockResolvedValue({});
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(204);
    });

    it('DELETE /api/positions/:id should return 500 on delete error', async () => {
        (deletePosition as jest.Mock).mockRejectedValue(new Error('Delete error'));
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error deleting position' });
    });

    it('should respond with 404 for non-existing position', async () => {
        (deletePosition as jest.Mock).mockRejectedValue(new Error('Position not found'));
        const response = await request(app).delete('/api/positions/99');
        expect(response.status).toBe(404);
    });

    // New tests for edge cases and error paths
    it('GET /api/positions should return 400 for invalid query params', async () => {
        const response = await request(app).get('/api/positions?limit=invalid');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid limit parameter' });
    });

    it('POST /api/positions without required fields should return 400', async () => {
        const response = await request(app).post('/api/positions').send({ symbol: 'TSLA' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid position data');
    });
});