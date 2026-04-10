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
import { requestQueueMiddleware } from './middleware/requestQueueingMiddleware';
import { MemoryMonitor } from './memoryMonitor';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

const shutdown = async () => {
    console.log('Received shutdown signal. Closing HTTP server...');
    await server.close();
    console.log('HTTP server closed. Closing database connection...');
    await dbPool.drain();
    console.log('Database connection closed. Exiting...');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 })); // Limit requests
app.use(requestQueueMiddleware); // Enable request queuing

app.get('/health', async (req, res) => {
    try {
        const health = await priceAggregator.checkDependencies();
        res.status(200).json({ status: 'healthy', dependencies: health });
    } catch (error) {
        logError(error, { message: 'Health check failed' });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/ready', (req, res) => {
    // Simple readiness check, can be expanded
    res.status(200).json({ status: 'ready' });
});

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});
setInterval(() => memoryMonitor.logMemoryUsage(), 60000); // Monitor memory usage every minute.