import express from 'express';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { logStartup, logRequest, logError, logRequestId } from './logger';
import alertRoutes from './alert.routes';
import { config } from './config';
import mongoose from 'mongoose';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  logRequestId(req, res);
  res.on('finish', () => logRequest(req, res, start));
  next();
});
app.use('/api', alertRoutes);
app.get('/health', HealthCheck.checkHealth);
app.get('/ready', (req, res) => res.json({ ready: true }));

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    logError(error, { message: 'Failed to connect to MongoDB' });
    process.exit(1);
  }
};

connectDatabase();

const server = app.listen(config.PORT, () => {
  logStartup({ thresholds: alertConfig.getConfiguration().thresholds });
  console.log(`Alert system running on port ${config.PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);