import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';
import { PriceAggregator } from './priceAggregator';
import { checkHealth } from './httpClient';
import { requestQueueMiddleware } from './middleware/requestQueueingMiddleware';
import { MemoryMonitor } from './memoryMonitor';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(express.json());
app.use(errorMiddleware);
app.use(requestQueueMiddleware);

// Start memory monitoring
memoryMonitor.startLogging();

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const healthStatus = await checkHealth();
        res.status(200).json({ status: 'healthy', dependencies: healthStatus });
    } catch (error) {
        logError(error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Ready endpoint
app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'ready' });
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

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});
