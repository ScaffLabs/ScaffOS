import request from 'supertest';
import { createServer } from '../src/index';

describe('Health Check', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  test('GET /health - health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.text).toBe('Order Engine is healthy!');
  });

  test('GET /ready - readiness check', async () => {
    const response = await request(app)
      .get('/ready')
      .expect(200);

    expect(response.text).toBe('Order Engine is ready!');
  });
});
