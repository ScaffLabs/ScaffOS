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
app.use(errorMiddleware);  // Add error handling middleware

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await dbPool.drain();
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);