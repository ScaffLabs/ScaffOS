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
        console.log('Migration utility called.');
        await this.storage.migrate();
    }

    async seedData(): Promise<void> {
        console.log('Seeding data...');
        await this.storage.seedData();
    }

    async findEventById(id: string): Promise<T | null> {
        return await this.storage.read(id);
    }

    async createEvent(item: T): Promise<T> {
        return await this.storage.create(item);
    }

    async updateEvent(id: string, item: T): Promise<T | null> {
        return await this.storage.update(id, item);
    }

    async deleteEvent(id: string): Promise<boolean> {
        return await this.storage.delete(id);
    }

    async findAllEvents(limit = 10, offset = 0): Promise<T[]> {
        return await this.storage.findAll(limit, offset);
    }
}
