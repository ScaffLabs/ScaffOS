import express from 'express';
import csurf from 'csurf';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { MigrationUtil } from './migrations';
import { logStartup, logRequest, logError } from './logger';
import { errorMiddleware } from './error.middleware';
import alertRoutes from './alert.routes';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

// CSRF protection middleware
const csrfProtection = csurf();
app.use(csrfProtection);

app.use(express.json());
app.use('/api', alertRoutes);
app.use('/health', async (req, res) => {
    const health = await HealthCheck.checkServices(['webhook', 'email', 'websocket']);
    return res.json(health);
});
app.use('/ready', (req, res) => {
    return res.json({ ready: true });
});

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => logRequest(req, res, start));
    next();
});

app.use(errorMiddleware);

const server = app.listen(3000, () => {
    logStartup({ thresholds: alertConfig.getConfiguration().thresholds, services: ['webhook', 'email', 'websocket'] });
    console.log('Alert system running on port 3000');
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing HTTP server');
    await alertStore.transaction([]); // Drain connections
    server.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
    console.log('SIGINT received: closing HTTP server');
    await alertStore.transaction([]); // Drain connections
    server.close(() => process.exit(0));
});