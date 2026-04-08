import { AlertMessage } from './alert.schema';
import { AlertStore } from './storage';

export class MigrationUtil {
    static async seedData(store: AlertStore) {
        const seedData: AlertMessage[] = [
            { id: '1', type: 'price', threshold: 100, currentValue: 90, createdAt: new Date() },
            { id: '2', type: 'risk', threshold: 50, currentValue: 30, createdAt: new Date() }
        ];
        for (const item of seedData) {
            await store.create(item);
        }
    }

    static async migrateToNewVersion(store: AlertStore, newSchema: any) {
        // Logic to migrate data to a new schema version.
        const allAlerts = await store.findIndex({});
        for (const alert of allAlerts) {
            // Migrate alert to new schema.
            await store.update(alert.id, { ...alert, migrated: true });
        }
    }
}