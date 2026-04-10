import { Strategy } from '../types';
import { SQLiteStore } from './database';

const seedData: Strategy[] = [
    { name: 'Strategy A', parameters: { param1: 'value1' } },
    { name: 'Strategy B', parameters: { param1: 'value2' } },
];

export const migrateData = async (store: SQLiteStore<Strategy>) => {
    for (const data of seedData) {
        await store.create(data);
    }
};

export const runMigrations = async (store: SQLiteStore<Strategy>) => {
    try {
        console.log('Starting data migration...');
        await migrateData(store);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};