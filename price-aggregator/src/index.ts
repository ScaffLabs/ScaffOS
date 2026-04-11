import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';
import { PriceAggregator } from './priceAggregator';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();

app.use(express.json());
app.use(errorMiddleware);

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

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});