import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import { healthCheckAllServices } from './services/portfolioService';
import http from 'http';
import logger from './services/logger';
import { createPool } from 'generic-pool';
import { register, collectDefaultMetrics } from 'prom-client';
import { setInterval } from 'timers';

const app = express();
app.use(json());
app.use(helmet());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

connectToEventBus();
app.use('/api/portfolios', portfolioRoutes);

const pool = createPool({
    create: async () => {
        // Replace with your actual connection creation logic
        const client = await someAsyncConnectionFunction();
        return client;
    },
    destroy: async (client) => {
        await client.close();
    }
}, {
    min: 2,
    max: 10
});

app.get('/health', async (req, res) => {
    try {
        const serviceStatus = await healthCheckAllServices();
        logger.info('Health check successful', { services: serviceStatus });
        res.json({ status: 'UP', services: serviceStatus });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const onShutdown = async () => {
    logger.info('Shutting down gracefully...');
    await pool.drain(); // Wait for connections to finish
    await pool.clear(); // Clear the pool
    server.close(() => {
        logger.info('Server closed');
    });
};

process.on('SIGTERM', onShutdown);
process.on('SIGINT', onShutdown);

server.listen(PORT, () => {
    logger.info(`Portfolio Tracker service running on port ${PORT}`);
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

collectDefaultMetrics();
setInterval(() => {
    logger.info('Memory Usage:', { memoryUsage: process.memoryUsage() });
}, 60000);