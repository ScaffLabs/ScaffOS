import { AlertMessage } from './alert.schema';
import { AlertStoreInterface } from './storage';

export class MigrationUtil {
    static async seedData(store: AlertStoreInterface) {
        const seedData: AlertMessage[] = [
            { id: '1' as OrderId, type: 'price', threshold: 100, currentValue: 90, createdAt: new Date() },
            { id: '2' as OrderId, type: 'risk', threshold: 50, currentValue: 30, createdAt: new Date() }
        ];
        for (const item of seedData) {
            await store.create(item);
        }
    }

    static async migrateToNewVersion(store: AlertStoreInterface, newSchema: any) {
        const allAlerts = await store.findIndex({});
        for (const alert of allAlerts) {
            // Example migration logic to a new schema version.
            await store.update(alert.id, { ...alert, migrated: true });
        }
    }

    static async migrateData(store: AlertStoreInterface) {
        const allAlerts = await store.findIndex({});
        const operations = allAlerts.map(alert => async () => {
            // Example migration logic to add a new field
            await store.update(alert.id, { newField: 'defaultValue' });
        });
        await store.transaction(operations);
    }
}