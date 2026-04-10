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
import { MemoryMonitor } from './memoryMonitor';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 }));
app.use(errorMiddleware);  // Add error handling middleware

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const healthStatus = await priceAggregator.checkDependencies();
        res.status(200).json({ status: 'healthy', dependencies: healthStatus });
    } catch (error) {
        logError(error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
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
    memoryMonitor.startLogging(); // Start memory monitoring
});