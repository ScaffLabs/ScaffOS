import express from 'express';
import { Server } from 'ws';
import http from 'http';
import { PriceAggregator } from './priceAggregator';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const priceAggregator = new PriceAggregator();

// Middleware Setup
app.use(cors({ origin: ['http://allowedorigin.com'] }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get('/prices', async (req, res) => {
    try {
        const prices = priceAggregator.getCurrentPrices();
        res.json(prices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

app.get('/health', async (req, res) => {
    try {
        const healthCheck = await priceAggregator.checkDependencies();
        res.json({ status: 'healthy', dependencies: healthCheck });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

wss.on('connection', (ws) => {
    priceAggregator.subscribe(ws);
});

server.listen(3000, () => {
    console.log('Price aggregator service running on port 3000');
});
