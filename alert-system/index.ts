import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { config } from './config';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

app.use(express.json());
app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

connectDatabase();

const server = app.listen(config.PORT, () => {
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