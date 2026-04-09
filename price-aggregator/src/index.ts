import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logStartup } from './logger';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validatePriceUpdate } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

app.use(express.json());
app.use(limiter);
app.use(errorMiddleware);

app.get('/prices', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'exchange', order = 'asc' } = req.query;
    try {
        const prices = await priceAggregator.getPrices({ limit: Number(limit), offset: Number(offset), sort, order });
        if (prices.length === 0) return res.status(204).send();
        return res.status(200).json(prices);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post('/prices', validatePriceData, handleValidationErrors, async (req, res) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        return res.status(201).json(newPrice);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.put('/prices/:exchange', validatePriceUpdate, handleValidationErrors, async (req, res) => {
    const { exchange } = req.params;
    try {
        const updatedPrice = await priceAggregator.updatePrice(exchange, req.body);
        if (!updatedPrice) return res.status(404).json({ error: 'Price not found' });
        return res.status(200).json(updatedPrice);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.delete('/prices/:exchange', async (req, res) => {
    const { exchange } = req.params;
    try {
        const deleted = await priceAggregator.deletePrice(exchange);
        if (!deleted) return res.status(404).json({ error: 'Price not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/health', async (req, res) => {
    try {
        await dbPool.query('SELECT 1');
        const dependenciesHealth = await priceAggregator.checkDependencies();
        return res.status(200).json({ status: 'healthy', dependencies: dependenciesHealth });
    } catch (error) {
        return res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

server.listen(config.port, () => {
    logStartup({ port: config.port });
});
