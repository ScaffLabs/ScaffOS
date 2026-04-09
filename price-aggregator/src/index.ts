import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logStartup } from './logger';
import { PriceAggregator } from './priceAggregator';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();

app.use(express.json());
app.use(errorMiddleware);

app.get('/health', async (req, res) => {
    try {
        await dbPool.query('SELECT 1');
        const dependenciesHealth = await priceAggregator.checkDependencies();
        return res.status(200).json({ status: 'healthy', dependencies: dependenciesHealth });
    } catch (error) {
        return res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/ready', async (req, res) => {
    return res.status(200).json({ status: 'ready' });
});

server.listen(config.port, () => {
    logStartup({ port: config.port });
});