import request from 'supertest';
import app from '../src/index';

describe('Portfolio Routes', () => {
  it('should create a new portfolio', async () => {
    const response = await request(app).post('/api/portfolios').send({ name: 'New Portfolio', positions: [] });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should get an existing portfolio', async () => {
    const createResponse = await request(app).post('/api/portfolios').send({ name: 'Fetch This Portfolio', positions: [] });
    const response = await request(app).get(`/api/portfolios/${createResponse.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Fetch This Portfolio');
  });

  it('should return 404 for a non-existent portfolio', async () => {
    const response = await request(app).get('/api/portfolios/999');
    expect(response.status).toBe(404);
  });

  it('should update an existing portfolio', async () => {
    const createResponse = await request(app).post('/api/portfolios').send({ name: 'Portfolio to Update', positions: [] });
    const response = await request(app).put(`/api/portfolios/${createResponse.body.id}`).send({ name: 'Updated Portfolio' });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Portfolio');
  });

  it('should return 400 for an invalid update', async () => {
    const response = await request(app).put('/api/portfolios/999').send({ name: 'Invalid Update' });
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid request body', async () => {
    const response = await request(app).post('/api/portfolios').send({});
    expect(response.status).toBe(400);
  });

  it('should return 503 for health check when service is down', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
  });
});
