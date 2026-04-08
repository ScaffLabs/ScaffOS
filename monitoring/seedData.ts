import InMemoryStore from './dataStore';

export const seedData = (store: InMemoryStore<any>) => {
    const sampleData = [
        { id: '1', value: 100 },
        { id: '2', value: 200 },
        { id: '3', value: 300 }
    ];

    sampleData.forEach(data => {
        store.create(data, data.id);
    });
};