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
        { id: '1', value: 100 } as unknown as T,
        { id: '2', value: 200 } as unknown as T,
        { id: '3', value: 300 } as unknown as T,
        { id: '4', value: 400 } as unknown as T,
        { id: '5', value: 500 } as unknown as T,
        { id: '6', value: 600 } as unknown as T,
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