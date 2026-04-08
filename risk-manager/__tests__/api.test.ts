import request from 'supertest';
import app from '../server';
import { createMockRiskPosition } from './fixtures';

describe('Risk Manager API', () => {
  let validToken: string;

  beforeAll(() => {
    // Assume a valid token is generated here for testing
    validToken = 'Bearer valid_token';
  });

  it('should create a new risk position', async () => {
    const newPosition = createMockRiskPosition();
    const response = await request(app)
      .post('/api/risk')
      .send(newPosition)
      .set('Authorization', validToken);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.asset).toBe(newPosition.asset);
  });

  it('should return 400 for invalid risk position', async () => {
    const response = await request(app)
      .post('/api/risk')
      .send({ asset: '', position: -10 })
      .set('Authorization', validToken);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should retrieve risk positions', async () => {
    const response = await request(app)
      .get('/api/risk')
      .query({ limit: 10, offset: 0 })
      .set('Authorization', validToken);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update a risk position', async () => {
    const newPosition = createMockRiskPosition();
    const createResponse = await request(app)
      .post('/api/risk')
      .send(newPosition)
      .set('Authorization', validToken);
    const positionId = createResponse.body.id;

    const response = await request(app)
      .put(`/api/risk/${positionId}`)
      .send({ position: 100 })
      .set('Authorization', validToken);
    expect(response.status).toBe(204);
  });

  it('should delete a risk position', async () => {
    const newPosition = createMockRiskPosition();
    const createResponse = await request(app)
      .post('/api/risk')
      .send(newPosition)
      .set('Authorization', validToken);
    const positionId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/risk/${positionId}`)
      .set('Authorization', validToken);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing risk position', async () => {
    const response = await request(app)
      .put('/api/risk/non_existing_id')
      .send({ position: 100 })
      .set('Authorization', validToken);
    expect(response.status).toBe(404);
  });

  it('should return 404 for deleting non-existing risk position', async () => {
    const response = await request(app)
      .delete('/api/risk/non_existing_id')
      .set('Authorization', validToken);
    expect(response.status).toBe(404);
  });

  it('should handle internal server error gracefully', async () => {
    jest.spyOn(app, 'get').mockImplementationOnce(() => { throw new Error('Test error'); });
    const response = await request(app)
      .get('/api/risk')
      .set('Authorization', validToken);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
