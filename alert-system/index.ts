import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore } from './storage';
import { config } from './config';
import logger, { logRequestId, logRequest, logError, logStartup } from './logger';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertStore = new AlertStore();

app.use(express.json());
app.use((req, res, next) => {
    logRequestId(req, res);
    const start = Date.now();
    res.on('finish', () => logRequest(req, res, start));
    next();
});

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
    logStartup(config);
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
    logError(err, 'Uncaught Exception');
    shutdown();
});

process.on('unhandledRejection', (reason) => {
    logError(new Error(String(reason)), 'Unhandled Rejection');
    shutdown();
});

app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});

const memoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    logger.info({ memoryUsage }, 'Memory usage statistics');
};

setInterval(memoryUsage, 60000); // Log memory usage every minute
