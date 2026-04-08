import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import { healthCheckPortfolioService } from './services/portfolioService';
import { createPool } from 'generic-pool';
import http from 'http';
import { register } from 'prom-client';
import expressSanitizer from 'express-sanitizer';
import csrf from 'csurf';

const app = express();
app.use(json());
app.use(helmet());
app.use(cors({ origin: ['https://your-allowed-origin.com'] }));
app.use(expressSanitizer());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
}));

const csrfProtection = csrf();
app.use(csrfProtection);

connectToEventBus();

app.use('/api/portfolios', portfolioRoutes);

app.get('/health', async (req, res) => {
    try {
        const portfolioServiceStatus = await healthCheckPortfolioService();
        res.json({ status: 'UP', portfolioService: portfolioServiceStatus });
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

// Health monitoring
const collectDefaultMetrics = require('prom-client').collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Connection Pooling example
const pool = createPool({
    create: async () => {
        // Create a connection to your database or service
    },
    destroy: async (client) => {
        // Cleanup connection
    },
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    evictionRunIntervalMillis: 15000,
    testOnBorrow: true,
    validate: async (client) => true
});