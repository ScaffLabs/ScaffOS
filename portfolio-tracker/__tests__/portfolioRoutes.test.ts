import request from 'supertest';
import app from '../src/index';
import { validPortfolio, invalidPortfolio, portfolioWithNegativeQuantity, portfolioWithEmptySymbol, portfolioWithZeroQuantity } from './fixtures/portfolioFixtures';

describe('Portfolio Routes', () => {
    it('should create a new portfolio', async () => {
        const response = await request(app).post('/api/portfolios').send(validPortfolio);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid request body', async () => {
        const response = await request(app).post('/api/portfolios').send(invalidPortfolio);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Name is required' })]));
    });

    it('should return 400 for portfolio with negative quantity', async () => {
        const response = await request(app).post('/api/portfolios').send(portfolioWithNegativeQuantity);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid position data. Ensure symbol is provided and quantities are non-negative.' })]));
    });

    it('should return 400 for portfolio with empty symbol', async () => {
        const response = await request(app).post('/api/portfolios').send(portfolioWithEmptySymbol);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid position data. Ensure symbol is provided and quantities are non-negative.' })]));
    });

    it('should return 400 for portfolio with zero quantity', async () => {
        const response = await request(app).post('/api/portfolios').send(portfolioWithZeroQuantity);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid position data. Ensure symbol is provided and quantities are non-negative.' })]));
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

    it('should return 404 for an invalid update', async () => {
        const response = await request(app).put('/api/portfolios/999').send({ name: 'Invalid Update' });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Portfolio not found');
    });

    it('should delete an existing portfolio', async () => {
        const createResponse = await request(app).post('/api/portfolios').send(validPortfolio);
        const response = await request(app).delete(`/api/portfolios/${createResponse.body.id}`);
        expect(response.status).toBe(204);
    });

    it('should return 404 for delete on a non-existent portfolio', async () => {
        const response = await request(app).delete('/api/portfolios/999');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Portfolio not found');
    });

    it('should return 200 for health check', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
    });

    it('should return 503 for health check if external service is down', async () => {
        jest.mock('axios');
        const mockedAxios = require('axios');
        mockedAxios.get.mockImplementationOnce(() => Promise.reject(new Error('Service is down')));

        const response = await request(app).get('/api/health');
        expect(response.status).toBe(503);
        expect(response.body.status).toBe('DOWN');
    });
});
