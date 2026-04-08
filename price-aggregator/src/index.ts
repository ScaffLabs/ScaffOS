import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import { MemoryMonitor } from './memoryMonitor';
import http from 'http';
import { logError } from './logger';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

const startApp = async () => {
    const oldData = []; // Fetch or define old data here
    await migrateData(oldData);
    await seedData();

    app.get('/health', async (req, res) => {
        try {
            const health = await priceAggregator.checkDependencies();
            res.status(200).json({ status: 'healthy', dependencies: health });
        } catch (error) {
            logError(error, 'Health Check');
            res.status(500).json({ status: 'unhealthy', error: error.message });
        }
    });

    app.get('/ready', (req, res) => {
        // Implement readiness logic if needed
        res.status(200).json({ status: 'ready' });
    });

    httpServer.listen(3000, () => {
        console.log('Price aggregator service running on port 3000');
    });

    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000); // Log memory usage every minute
};

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forcing shutdown after 10 seconds');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startApp();
