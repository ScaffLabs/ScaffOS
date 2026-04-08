import { storage } from './storage';
import { PriceData } from './types';

export const migrateData = async (oldData: PriceData[]) => {
    for (const data of oldData) {
        await storage.create(data);
    }
};

export const seedData = async () => {
    const seedPrices: PriceData[] = [
        { exchange: 'exchange1', price: 100, volume: 10 },
        { exchange: 'exchange2', price: 200, volume: 20 },
    ];
    for (const price of seedPrices) {
        await storage.create(price);
    }
};