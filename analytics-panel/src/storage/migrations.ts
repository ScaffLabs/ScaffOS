import { InMemoryStore } from './inMemoryStore';
import { Strategy } from '../types';

const seedData: Strategy[] = [
    { name: 'Strategy A', parameters: { param1: 'value1' } },
    { name: 'Strategy B', parameters: { param1: 'value2' } },
];

export const migrateData = async (store: InMemoryStore<Strategy>) => {
    for (const data of seedData) {
        await store.create(data);
    }
};

export const runMigrations = async (store: InMemoryStore<Strategy>) => {
    try {
        await migrateData(store);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};
