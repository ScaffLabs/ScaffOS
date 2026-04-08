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

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors({ origin: ['http://allowedorigin.com'] }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// GET /prices with pagination, filtering, and sorting
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

// POST /prices to add a new price
app.post('/prices', [
    body('exchange').notEmpty().withMessage('Exchange is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('volume').isNumeric().withMessage('Volume must be a number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { exchange, price, volume } = req.body;
    try {
        await priceAggregator.addPrice({ exchange, price, volume });
        res.status(201).json({ message: 'Price added successfully' });
    } catch (error) {
        res.status(409).json({ error: 'Conflict while adding price' });
    }
});

// DELETE /prices/:exchange to delete a price
app.delete('/prices/:exchange', async (req, res) => {
    const { exchange } = req.params;
    try {
        await priceAggregator.deletePrice(exchange);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: 'Price not found' });
    }
});

wss.on('connection', (ws) => {
    priceAggregator.subscribe(ws);
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