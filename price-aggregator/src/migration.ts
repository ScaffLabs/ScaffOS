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
    await Promise.all(seedPrices.map(price => storage.create(price)));
};

export const clearData = async () => {
    await storage.transaction(async () => {
        const allPrices = await storage.findAll();
        await Promise.all(allPrices.map(async (price) => await storage.delete(price.id!)));
    });
};