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
}