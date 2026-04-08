import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import { MemoryMonitor } from './memoryMonitor';
import http from 'http';
import errorMiddleware from './errorMiddleware';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(express.json());

const startApp = async () => {
    const oldData = [];
    await migrateData(oldData);
    await seedData();

    app.get('/health', async (req, res) => {
        try {
            const health = await priceAggregator.checkDependencies();
            res.status(200).json({ status: 'healthy', dependencies: health });
        } catch (error) {
            next(error);
        }
    });

    app.get('/prices', async (req, res, next) => {
        try {
            const prices = await priceAggregator.getCurrentPrices();
            if (Object.keys(prices).length === 0) return res.status(204).send();
            res.status(200).json(prices);
        } catch (error) {
            next(error);
        }
    });

    app.use(errorMiddleware);

    httpServer.listen(3000, () => {
        console.log('Price aggregator service running on port 3000');
    });

    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000);
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