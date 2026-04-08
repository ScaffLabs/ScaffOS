import request from 'supertest';
import app from '../src/index';
import { validPortfolio, invalidPortfolio } from './fixtures/portfolioFixtures';

describe('Portfolio Routes', () => {
    it('should create a new portfolio', async () => {
        const response = await request(app).post('/api/portfolios').send(validPortfolio);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid request body', async () => {
        const response = await request(app).post('/api/portfolios').send(invalidPortfolio);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid value', param: 'name' })]));
    });

    it('should get an existing portfolio', async () => {
        const createResponse = await request(app).post('/api/portfolios').send(validPortfolio);
        const response = await request(app).get(`/api/portfolios/${createResponse.body.id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(validPortfolio.name);
    });

    it('should return 404 for a non-existent portfolio', async () => {
        const response = await request(app).get('/api/portfolios/999');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Portfolio not found');
    });

    it('should update an existing portfolio', async () => {
        const createResponse = await request(app).post('/api/portfolios').send(validPortfolio);
        const response = await request(app).put(`/api/portfolios/${createResponse.body.id}`).send({ name: 'Updated Portfolio' });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Portfolio');
    });

    it('should return 400 for an invalid update', async () => {
        const response = await request(app).put('/api/portfolios/999').send({ name: 'Invalid Update' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Portfolio not found');
    });

    it('should handle empty positions array on portfolio creation', async () => {
        const response = await request(app).post('/api/portfolios').send({ name: 'Empty Positions Portfolio', positions: [] });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.positions).toEqual([]);
    });

    it('should return 400 for empty name', async () => {
        const response = await request(app).post('/api/portfolios').send({ name: '', positions: [] });
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid value', param: 'name' })]));
    });

    it('should return 400 for invalid position data', async () => {
        const response = await request(app).post('/api/portfolios').send({ name: 'Invalid Positions', positions: [{ symbol: 'AAPL', quantity: -10, averagePrice: 150 }] });
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid position data' })]));
    });
});
