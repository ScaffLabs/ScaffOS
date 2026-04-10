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
import bodyParser from 'body-parser';
import { requestQueueMiddleware } from './middleware/requestQueueingMiddleware';
import { MemoryMonitor } from './memoryMonitor';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' })); // Limit request size to 1MB
app.use(bodyParser.json({ type: ['application/json', 'application/vnd.api+json'] })); // Validate content types
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 })); // Limit requests
app.use(requestQueueMiddleware); // Enable request queuing

app.use((req, res, next) => {
    const allowedContentTypes = ['application/json'];
    if (!allowedContentTypes.includes(req.headers['content-type'])) {
        return res.status(415).json({ error: 'Unsupported Media Type' });
    }
    next();
});

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

server.listen(config.port, () => {
    logStartup({ port: config.port, nodeEnv: config.nodeEnv });
});
setInterval(() => memoryMonitor.logMemoryUsage(), 60000); // Monitor memory usage every minute.