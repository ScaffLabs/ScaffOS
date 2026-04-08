import express from 'express';
import { Server } from 'ws';
import http from 'http';
import { PriceAggregator } from './priceAggregator';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const priceAggregator = new PriceAggregator();

app.get('/prices', (req, res) => {
    res.json(priceAggregator.getCurrentPrices());
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
