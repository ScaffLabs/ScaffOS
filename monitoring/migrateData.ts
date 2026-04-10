import InMemoryStore from './dataStore';
import { ValidationError } from './errorClasses';
import { LatencyData } from './types';

export const migrateData = async <T>(sourceStore: InMemoryStore<T>, targetStore: InMemoryStore<T>): Promise<void> => {
    try {
        for (const [id, entity] of sourceStore.storage.entries()) {
            targetStore.create(entity.data, id);
        }
    } catch (error) {
        throw new ValidationError('Data migration failed: ' + error.message);
    }
};

export const seedData = (store: InMemoryStore<LatencyData>): void => {
    const sampleData: LatencyData[] = [
        { path: '/api/test1', duration: 100, timestamp: new Date() },
        { path: '/api/test2', duration: 200, timestamp: new Date() },
        { path: '/api/test3', duration: 300, timestamp: new Date() },
        { path: '/api/test4', duration: 400, timestamp: new Date() },
    ];

    sampleData.forEach(data => {
        store.create(data, data.path);
    });
};

export const clearStore = <T>(store: InMemoryStore<T>): void => {
    store.clearData();
};

export const migrateStore = (sourceStore: InMemoryStore<any>, targetStore: InMemoryStore<any>): void => {
    sourceStore.migrateData(targetStore);
};