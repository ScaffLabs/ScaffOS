import { IStorage } from './IStorage';
import { InMemoryEventStorage } from './InMemoryEventStorage';
import { Event } from '../types';

export class StorageManager<T> {
    private storage: IStorage<T>;

    constructor(storageType: 'memory') {
        if (storageType === 'memory') {
            this.storage = new InMemoryEventStorage();
        } else {
            throw new Error('Storage type not supported yet');
        }
    }

    getStorage(): IStorage<T> {
        return this.storage;
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
