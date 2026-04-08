import express from 'express';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { MigrationUtil } from './migrations';
import { logStartup } from './logger';
import { errorMiddleware } from './error.middleware';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

app.use(express.json());
app.use('/health', (req, res) => new AlertController().healthCheck(req, res));
app.use('/ready', (req, res) => new AlertController().readyCheck(req, res));

process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing HTTP server');
    await alertStore.transaction([]); // Drain connections
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received: closing HTTP server');
    await alertStore.transaction([]); // Drain connections
    process.exit(0);
});

app.use(errorMiddleware);

const server = app.listen(3000, () => {
    logStartup({ thresholds: alertConfig.getConfiguration().thresholds, services: ['webhook', 'email', 'websocket'] });
    console.log('Alert system running on port 3000');
});

HealthCheck.checkServices(['webhook', 'email', 'websocket']);
MigrationUtil.seedData(alertStore);
