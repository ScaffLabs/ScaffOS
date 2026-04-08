import { InMemoryStore } from './inMemoryStore';

// Example migration utility for seeding initial data
export const migrateData = async (store: InMemoryStore<any>) => {
    const seedData = [
        { name: 'Strategy A', parameters: { /* parameters */ } },
        { name: 'Strategy B', parameters: { /* parameters */ } },
    ];

    for (const data of seedData) {
        await store.create(data);
    }
};

export const runMigrations = async (store: InMemoryStore<any>) => {
    await migrateData(store);
};
