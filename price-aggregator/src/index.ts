import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { httpClient } from './httpClient';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();

app.use(helmet());
app.use(cors({ origin: ['https://allowed-origin.com'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.get('/health', async (req, res, next) => {
    try {
        await httpClient('/health'); // Check if dependent service is up
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.use(errorMiddleware);

const startApp = async () => {
    console.log(`Price aggregator service running on port ${config.port}`);
    httpServer.listen(config.port);
};

startApp();