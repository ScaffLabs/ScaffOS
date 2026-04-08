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
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(json());
app.use(helmet());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

connectToEventBus();

// Middleware to generate request ID
app.use((req, res, next) => {
    req.id = uuidv4();
    next();
});

app.use('/api/portfolios', portfolioRoutes);

app.get('/health', async (req, res) => {
    try {
        logger.info('Health check initiated', { requestId: req.id });
        const serviceStatus = await healthCheckAllServices();
        logger.info('Health check successful', { services: serviceStatus, requestId: req.id });
        res.json({ status: 'UP', services: serviceStatus });
    } catch (error) {
        logger.error('Health check failed', { error: error.message, requestId: req.id });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const onShutdown = async () => {
    logger.info('Shutting down gracefully...');
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
