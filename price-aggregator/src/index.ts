import express from 'express';
import { Server } from 'ws';
import http from 'http';
import { PriceAggregator } from './priceAggregator';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import { MemoryMonitor } from './memoryMonitor';
import { createPool } from 'generic-pool';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

const pool = createPool({
    create: async () => {
        // Create connection logic here
    },
    destroy: async (client) => {
        // Destroy connection logic here
    },
}, { min: 2, max: 10 });

app.use(cors({ origin: ['http://allowedorigin.com'] }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.get('/prices', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'price', order = 'asc' } = req.query;
    try {
        const prices = priceAggregator.getCurrentPrices();
        let sortedPrices = Object.entries(prices).sort((a, b) => {
            const comparison = order === 'asc' ? a[1] - b[1] : b[1] - a[1];
            return comparison;
        });
        const paginatedPrices = sortedPrices.slice(offset, offset + limit);
        res.json(paginatedPrices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

app.get('/health', async (req, res) => {
    try {
        const health = await priceAggregator.checkDependencies();
        res.json({ status: 'healthy', dependencies: health });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/ready', (req, res) => {
    // Implement readiness check logic here
    res.json({ status: 'ready' });
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await priceAggregator.shutdown();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

setInterval(() => memoryMonitor.logMemoryUsage(), 60000);

server.listen(3000, () => {
    console.log('Price aggregator service running on port 3000');
});