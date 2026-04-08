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
import { sanitize } from 'express-validator';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors({ origin: ['http://allowedorigin.com'] }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' })); // Request size limit

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

app.get('/prices', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'price', order = 'asc' } = req.query;

    // Validate and sanitize query parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedLimit = Math.min(Number(limit), 100); // Enforce max limit
    const sanitizedOffset = Math.max(Number(offset), 0);

    try {
        const prices = priceAggregator.getCurrentPrices();
        let sortedPrices = Object.entries(prices).sort((a, b) => {
            const comparison = order === 'asc' ? a[1] - b[1] : b[1] - a[1];
            return comparison;
        });
        const paginatedPrices = sortedPrices.slice(sanitizedOffset, sanitizedOffset + sanitizedLimit);
        res.json(paginatedPrices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

app.get('/health', async (req, res) => {
    try {
        const health = await priceAggregator.checkDependencies();
        res.json({ status: 'healthy', dependencies: health });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.use((req, res, next) => {
    const csrfToken = req.headers['x-csrf-token'];
    // Implement CSRF token validation here if needed
    next();
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
