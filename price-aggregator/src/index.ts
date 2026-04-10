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
import { seedData, clearData } from './migration';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 })); 

app.get('/seed', async (req, res) => {
    try {
        await seedData();
        res.status(200).json({ message: 'Seeding completed.' });
    } catch (error) {
        logError(error, { context: 'Seeding data' });
        res.status(500).json({ error: 'Error seeding data' });
    }
});

app.get('/clear', async (req, res) => {
    try {
        await clearData();
        res.status(200).json({ message: 'Clearing completed.' });
    } catch (error) {
        logError(error, { context: 'Clearing data' });
        res.status(500).json({ error: 'Error clearing data' });
    }
});

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});