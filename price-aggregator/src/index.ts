import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';

const app = express();
const priceAggregator = new PriceAggregator();

const startApp = async () => {
    const oldData = []; // Fetch or define old data here
    await migrateData(oldData);
    await seedData();

    app.listen(3000, () => {
        console.log('Price aggregator service running on port 3000');
    });
};

startApp();