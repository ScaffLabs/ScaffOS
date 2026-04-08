import { InMemoryStore } from './inMemoryStore';

export const migrateData = async (store: InMemoryStore<any>) => {
    const seedData = [
        { name: 'Strategy A', parameters: { param1: 'value1' } },
        { name: 'Strategy B', parameters: { param1: 'value2' } },
    ];

    for (const data of seedData) {
        await store.create(data);
    }
};

export const runMigrations = async (store: InMemoryStore<any>) => {
    try {
        await migrateData(store);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};