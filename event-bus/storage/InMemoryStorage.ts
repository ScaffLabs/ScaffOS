import { IStorage } from './IStorage';

export class InMemoryStorage<T> implements IStorage<T> {
    private storage: Record<string, T & { id: string }> = {};
    private currentId = 0;
    private index: Record<string, Record<string, T & { id: string }>> = {};

    async create(item: T): Promise<T & { id: string }> {
        const id = String(++this.currentId);
        this.storage[id] = { ...item, id } as T & { id: string };
        this.indexItem(id, this.storage[id]);
        return this.storage[id];
    }

    async read(id: string): Promise<T | null> {
        return this.storage[id] || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.storage[id]) return null;
        this.storage[id] = { ...this.storage[id], ...item };
        this.indexItem(id, this.storage[id]);
        return this.storage[id];
    }

    async delete(id: string): Promise<boolean> {
        if (!this.storage[id]) return false;
        this.removeFromIndex(id);
        delete this.storage[id];
        return true;
    }

    async findAll(limit = 10, offset = 0): Promise<T[]> {
        return Object.values(this.storage).slice(offset, offset + limit);
    }

    async findByField(field: keyof T, value: any): Promise<T[]> {
        return Object.values(this.index[field] || {}).filter(item => item[field] === value);
    }

    private indexItem(id: string, item: T & { id: string }): void {
        const keys = Object.keys(item);
        keys.forEach(key => {
            if (!this.index[key]) {
                this.index[key] = {};
            }
            this.index[key][id] = item;
        });
    }

    private removeFromIndex(id: string): void {
        const keys = Object.keys(this.index);
        keys.forEach(key => {
            if (this.index[key][id]) {
                delete this.index[key][id];
            }
        });
    }

    async transaction(operations: (() => Promise<void>)[]): Promise<void> {
        const results: Promise<void>[] = operations.map(op => op());
        await Promise.all(results);
    }

    async migrate(): Promise<void> {
        console.log('Performing migration...');
    }

    async seedData(): Promise<void> {
        console.log('Seeding data...');
        await this.create({ title: 'Sample Event', description: 'This is a sample event', type: 'userCreated' });
    }
}