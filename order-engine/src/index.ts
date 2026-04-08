import express from 'express';
import bodyParser from 'body-parser';
import { securityMiddleware, validateRequest } from './middleware';
import { createOrder, getOrders } from './orderController';
import { connectToDatabase, closeDatabaseConnection } from './db';
import { healthCheck, readyCheck } from './health';
import { setupGracefulShutdown } from './shutdown';
import { initializeMonitoring } from './monitoring';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(securityMiddleware);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.post('/orders', validateRequest, createOrder);
app.get('/orders', getOrders);

const startServer = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Order Engine listening on port ${PORT}`);
  });
};

setupGracefulShutdown();
initializeMonitoring();

startServer().catch(err => {
  console.error('Failed to start the server:', err);
  process.exit(1);
};
