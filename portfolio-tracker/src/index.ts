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
import CircuitBreaker from 'circuit-breaker-js';

const app = express();
app.use(json({ limit: '1mb' }));
app.use(helmet());
app.use(cors({
    origin: ['https://yourdomain.com', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

connectToEventBus();
app.use('/api/portfolios', portfolioRoutes);

const pool = createPool({
    create: async () => {
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

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorsThreshold: 2,
    resetTimeout: 10000
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
    await pool.drain();
    await pool.clear();
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

const requestQueue = [];
app.use((req, res, next) => {
    // Add request to queue
    requestQueue.push(req);
    // Process request immediately if queue is below allowed limit
    if (requestQueue.length <= 100) {
        next();
    } else {
        res.status(503).json({ error: 'Server busy, please retry later.' });
    }
});

