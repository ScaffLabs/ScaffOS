import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from './event-bus';
import { AlertProcessor } from './alert.processor';
import { HealthCheck } from './health-check';
import { config } from './config';
import logger, { logStartup } from './logger';
import bodyParser from 'body-parser';
import { errorMiddleware } from './error.middleware';
import cors from 'cors';
import helmet from 'helmet';
import alertRoutes from './alert.routes';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(errorMiddleware);

const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 5 };
mongoose.connect(config.MONGO_URI, mongoOptions)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);
app.use('/api/alerts', alertRoutes);

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
process.on('uncaughtException', shutdown);
process.on('unhandledRejection', shutdown);