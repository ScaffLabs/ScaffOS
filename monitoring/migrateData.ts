import InMemoryStore from './dataStore';
import { ValidationError } from './errorClasses';

export const migrateData = async <T>(sourceStore: InMemoryStore<T>, targetStore: InMemoryStore<T>): Promise<void> => {
    try {
        for (const [id, entity] of sourceStore.storage.entries()) {
            targetStore.create(entity.data, id);
        }
    } catch (error) {
        throw new ValidationError('Data migration failed: ' + error.message);
    }
};

export const seedData = <T>(store: InMemoryStore<T>): void => {
    const sampleData: T[] = [
        { id: '1', path: '/api/test1', duration: 100 } as unknown as T,
        { id: '2', path: '/api/test2', duration: 200 } as unknown as T,
        { id: '3', path: '/api/test3', duration: 300 } as unknown as T,
        { id: '4', path: '/api/test4', duration: 400 } as unknown as T,
    ];

    sampleData.forEach(data => {
        store.create(data, data.id);
    });
};

export const clearStore = <T>(store: InMemoryStore<T>): void => {
    store.clearData();
};

export const migrateStore = (sourceStore: InMemoryStore<any>, targetStore: InMemoryStore<any>): void => {
    sourceStore.migrateData(targetStore);
};