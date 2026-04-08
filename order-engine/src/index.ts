import express from 'express';
import bodyParser from 'body-parser';
import { securityMiddleware, validateRequest } from './middleware';
import { createOrder, getOrders } from './orderController';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(securityMiddleware);

app.get('/health', (req, res) => {
  res.status(200).send('Order Engine is healthy!');
});

app.post('/orders', validateRequest, createOrder);
app.get('/orders', getOrders);

app.listen(PORT, () => {
  console.log(`Order Engine listening on port ${PORT}`);
});