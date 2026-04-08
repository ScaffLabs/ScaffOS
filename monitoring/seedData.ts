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

// Function to seed additional data for testing and development
export const seedAdditionalData = (store: InMemoryStore<any>) => {
    const additionalData = [
        { id: '4', value: 400 },
        { id: '5', value: 500 },
        { id: '6', value: 600 }
    ];

    additionalData.forEach(data => {
        store.create(data, data.id);
    });
};