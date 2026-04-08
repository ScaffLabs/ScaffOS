import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();

const startApp = async () => {
    await migrateData([]); // Pass any old data if necessary
    await seedData(); // Seed initial data

    app.get('/prices', async (req, res, next) => {
        try {
            const prices = await priceAggregator.getCurrentPrices();
            res.status(200).json(prices);
        } catch (error) {
            next(error);
        }
    });

    // Additional endpoints and error handling...

    app.use(errorMiddleware);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
    });
};

startApp();