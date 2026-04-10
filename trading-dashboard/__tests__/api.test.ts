import request from 'supertest';
import app from '../src/server';
import { fetchPositions, updatePosition, deletePosition, createPosition } from '../src/api/portfolioApi';
import { mockPositionData } from './__mocks__/dataMocks';
import { jest } from '@jest/globals';

jest.mock('../src/api/portfolioApi');

describe('API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/positions should return positions', async () => {
        (fetchPositions as jest.Mock).mockResolvedValue(mockPositionData);
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPositionData);
    });

    it('GET /api/positions should return 500 on fetch error', async () => {
        (fetchPositions as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching positions' });
    });

    it('POST /api/positions should create a position', async () => {
        const newPosition = { id: '2', symbol: 'GOOGL', quantity: 5 };
        (createPosition as jest.Mock).mockResolvedValue(newPosition);
        const response = await request(app)
            .post('/api/positions')
            .send(newPosition);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Position created successfully', position: newPosition });
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
