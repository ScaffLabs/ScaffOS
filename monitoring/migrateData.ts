import InMemoryStore from './dataStore';
import { ValidationError } from './errorClasses';

export const migrateData = async (sourceStore: InMemoryStore<any>, targetStore: InMemoryStore<any>): Promise<void> => {
    try {
        for (const [id, entity] of sourceStore.storage.entries()) {
            targetStore.create(entity.data, id);
        }
    } catch (error) {
        throw new ValidationError('Data migration failed: ' + error.message);
    }
};