import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { HealthCheck } from './health-check';
import { config } from './config';
import logger from './logger';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);

app.use(express.json());

app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

connectDatabase();

const server = app.listen(config.PORT, () => {
    logger.info(`Alert system running on port ${config.PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await mongoose.connection.close();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    logger.error(err);
    shutdown();
});
process.on('unhandledRejection', (reason) => {
    logger.error(new Error(String(reason)));
    shutdown();
});
