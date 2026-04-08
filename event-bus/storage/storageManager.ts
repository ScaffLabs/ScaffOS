import { IStorage } from './IStorage';
import { InMemoryStorage } from './InMemoryStorage';

export class StorageManager<T> {
    private storage: IStorage<T>;

    constructor(storageType: 'memory' | 'sqlite' | 'postgresql') {
        if (storageType === 'memory') {
            this.storage = new InMemoryStorage<T>();
        } else {
            throw new Error('Storage type not supported yet');
        }
    }

    getStorage(): IStorage<T> {
        return this.storage;
    }

    async migrate(): Promise<void> {
        // Placeholder for data migration logic
        console.log('Migration utility called.');
    }

    async seedData(): Promise<void> {
        // Placeholder for data seeding logic
        console.log('Seeding data called.');
    }
}