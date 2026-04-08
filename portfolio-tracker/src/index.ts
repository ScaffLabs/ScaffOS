import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import { healthCheckAllServices } from './services/portfolioService';
import http from 'http';
import { register } from 'prom-client';

const app = express();
app.use(json());
app.use(helmet());
app.use(cors({ origin: ['https://your-allowed-origin.com'] }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

connectToEventBus();
app.use('/api/portfolios', portfolioRoutes);

app.get('/health', async (req, res) => {
    try {
        const serviceStatus = await healthCheckAllServices();
        res.json({ status: 'UP', services: serviceStatus });
    } catch (error) {
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const onShutdown = async () => {
    console.log('Shutting down gracefully...');
};

process.on('SIGTERM', onShutdown);
process.on('SIGINT', onShutdown);

server.listen(PORT, () => {
    console.log(`Portfolio Tracker service running on port ${PORT}`);
});

const collectDefaultMetrics = require('prom-client').collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
