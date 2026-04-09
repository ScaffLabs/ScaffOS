import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';
import { PriceAggregator } from './priceAggregator';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();

// CORS configuration
const allowedOrigins = ['https://example.com', 'https://another-example.com'];
app.use(cors({ origin: allowedOrigins }));

// Helmet for security headers
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

app.use(express.json());
app.use(limiter);
app.use(errorMiddleware);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

app.get('/prices', validatePriceData, handleValidationErrors, async (req, res) => {
    const { limit = 10, offset = 0, sort = 'exchange', order = 'asc' } = req.query;
    try {
        const prices = await priceAggregator.getPrices({ limit: Number(limit), offset: Number(offset), sort, order });
        if (prices.length === 0) return res.status(204).send();
        return res.status(200).json(prices);
    } catch (error) {
        logError(error, { path: req.path, method: req.method });
        return res.status(500).json({ error: error.message });
    }
});

app.post('/prices', validatePriceData, handleValidationErrors, async (req, res) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        return res.status(201).json(newPrice);
    } catch (error) {
        logError(error, { path: req.path, method: req.method });
        return res.status(400).json({ error: error.message });
    }
});

app.get('/health', async (req, res) => {
    try {
        await dbPool.query('SELECT 1');
        const dependenciesHealth = await priceAggregator.checkDependencies();
        return res.status(200).json({ status: 'healthy', dependencies: dependenciesHealth });
    } catch (error) {
        logError(error, { path: req.path, method: req.method });
        return res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});