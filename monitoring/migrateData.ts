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

export const seedData = <T>(store: InMemoryStore<T>, data: T[]) => {
    data.forEach((item, index) => {
        store.create(item, String(index + 1));
    });
};

export const clearStore = <T>(store: InMemoryStore<T>): void => {
    store.clearData();
};

export const migrateStore = (sourceStore: InMemoryStore<any>, targetStore: InMemoryStore<any>): void => {
    sourceStore.migrateData(targetStore);
};