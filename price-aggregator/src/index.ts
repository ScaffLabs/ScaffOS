import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';
import { MemoryMonitor } from './memoryMonitor';
import { createConnectionPool } from './dbConnection';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();
const connectionPool = createConnectionPool(); // Create a connection pool for DB connections

app.use(express.json());
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

const startApp = async () => {
    await migrateData([]);
    await seedData();
    logStartup(config);

    app.get('/prices', async (req, res, next) => {
        try {
            const prices = await priceAggregator.getCurrentPrices();
            if (Object.keys(prices).length === 0) {
                return res.status(204).send();
            }
            res.status(200).json(prices);
        } catch (error) {
            logError(error, 'Error fetching prices');
            next(error);
        }
    });

    app.post('/prices', validatePriceData, handleValidationErrors, async (req, res, next) => {
        try {
            const newPrice = await priceAggregator.addPrice(req.body);
            res.status(201).json(newPrice);
        } catch (error) {
            logError(error, 'Error adding price');
            next(error);
        }
    });

    app.get('/health', async (req, res, next) => {
        try {
            const health = await priceAggregator.checkDependencies();
            res.status(200).json({ status: 'healthy', dependencies: health });
        } catch (error) {
            logError(error, 'Health check failed');
            res.status(500).json({ status: 'unhealthy', error: error.message });
        }
    });

    app.get('/ready', async (req, res) => {
        // Implement readiness check based on the app state
        const isReady = await priceAggregator.isReady();
        if (isReady) {
            return res.status(200).json({ status: 'ready' });
        }
        res.status(503).json({ status: 'not ready' });
    });

    app.use(errorMiddleware);

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        await connectionPool.drain(); // Drain connections
        httpServer.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
        setInterval(() => memoryMonitor.logMemoryUsage(), 60000); // Log memory usage every minute
    });
};

startApp();
