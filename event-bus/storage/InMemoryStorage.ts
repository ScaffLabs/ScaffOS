import { IStorage } from './IStorage';

export class InMemoryStorage<T> implements IStorage<T> {
    private storage: Record<string, T & { id: string }> = {};
    private currentId = 0;
    private indexes: Record<string, Set<string>> = {};

    async create(item: T): Promise<T & { id: string }> {
        const id = String(++this.currentId);
        this.storage[id] = { ...item, id } as T & { id: string };
        this.indexItem(item, id);
        return this.storage[id];
    }

    async read(id: string): Promise<T | null> {
        return this.storage[id] || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.storage[id]) return null;
        this.unindexItem(this.storage[id]);
        this.storage[id] = { ...this.storage[id], ...item };
        this.indexItem(item, id);
        return this.storage[id];
    }

    async delete(id: string): Promise<boolean> {
        if (!this.storage[id]) return false;
        this.unindexItem(this.storage[id]);
        delete this.storage[id];
        return true;
    }

    async findAll(limit: number = 10, offset: number = 0): Promise<T[]> {
        return Object.values(this.storage).slice(offset, offset + limit);
    }

    private indexItem(item: T, id: string) {
        const keys = Object.keys(item);
        keys.forEach(key => {
            if (!this.indexes[key]) this.indexes[key] = new Set();
            this.indexes[key].add(id);
        });
    }

    private unindexItem(item: T) {
        const keys = Object.keys(item);
        keys.forEach(key => {
            if (this.indexes[key]) this.indexes[key].delete(item.id);
        });
    }

    async findByField(field: keyof T, value: any): Promise<T[]> {
        const ids = this.indexes[field]?.has(value) ? Array.from(this.indexes[field]) : [];
        return ids.map(id => this.storage[id]).filter(Boolean);
    }

    async transaction(operations: (() => Promise<void>)[]): Promise<void> {
        for (const operation of operations) {
            await operation();
        }
    }

    async migrate(): Promise<void> {
        console.log('Migration utility called.');
    }

    async seedData(data: T[]): Promise<void> {
        console.log('Seeding data...');
        for (const item of data) {
            await this.create(item);
        }
    }
}