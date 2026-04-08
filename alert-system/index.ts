import express from 'express';
import csurf from 'csurf';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { logStartup, logRequest, logError } from './logger';
import { errorMiddleware } from './error.middleware';
import alertRoutes from './alert.routes';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

app.use(express.json());
app.use('/api', alertRoutes);
app.use('/health', async (req, res) => {
    const health = await HealthCheck.checkServices(['webhook', 'email', 'websocket']);
    return res.json(health);
});
app.use('/ready', (req, res) => res.json({ ready: true }));

const server = app.listen(3000, () => {
    logStartup({ thresholds: alertConfig.getConfiguration().thresholds });
    console.log('Alert system running on port 3000');
});

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await alertStore.transaction([]); // Drain connections
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
