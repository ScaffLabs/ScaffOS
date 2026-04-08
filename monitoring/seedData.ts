import InMemoryStore from './dataStore';

export const seedData = (store: InMemoryStore<any>): void => {
    const sampleData = [
        { id: '1', value: 100 },
        { id: '2', value: 200 },
        { id: '3', value: 300 },
        { id: '4', value: 400 },
        { id: '5', value: 500 },
        { id: '6', value: 600 },
    ];

    sampleData.forEach(data => {
        store.create(data, data.id);
    });
};

export const clearStore = (store: InMemoryStore<any>): void => {
    store.clearData();
};

export const migrateStore = (sourceStore: InMemoryStore<any>, targetStore: InMemoryStore<any>): void => {
    sourceStore.migrateData(targetStore);
};