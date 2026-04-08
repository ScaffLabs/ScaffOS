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

export const clearData = async () => {
    await storage.transaction(async () => {
        const allPrices = await storage.findAll();
        await Promise.all(allPrices.map(price => storage.delete(price.id)));
    });
};

export const migrateToSQLite = async (sqliteData: PriceData[]) => {
    const sqliteStorage = new SQLiteStorage<PriceData>();
    for (const data of sqliteData) {
        await sqliteStorage.create(data);
    }
};

export const migrateToPostgreSQL = async (postgresData: PriceData[]) => {
    const postgresStorage = new PostgreSQLStorage<PriceData>();
    for (const data of postgresData) {
        await postgresStorage.create(data);
    }
};