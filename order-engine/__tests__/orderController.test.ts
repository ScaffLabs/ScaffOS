import request from 'supertest';
import { createServer } from '../src/index';
import { Order } from '../src/types';

describe('Order Controller', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /orders - create order', async () => {
    const newOrder: Order = {
      id: '1',
      type: 'limit',
      price: 100,
      quantity: 10,
      status: 'open',
    };

    const response = await request(app)
      .post('/orders')
      .send(newOrder)
      .expect(201);

    expect(response.body).toMatchObject(newOrder);
  });

  test('GET /orders - get all orders', async () => {
    const response = await request(app)
      .get('/orders')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('PUT /orders/:id - update order', async () => {
    const updatedOrder = { type: 'limit', price: 110, quantity: 5, status: 'open' };

    const response = await request(app)
      .put('/orders/1')
      .send(updatedOrder)
      .expect(200);

    expect(response.body).toMatchObject(updatedOrder);
  });

  test('DELETE /orders/:id - delete order', async () => {
    await request(app)
      .delete('/orders/1')
      .expect(204);
  });
});
