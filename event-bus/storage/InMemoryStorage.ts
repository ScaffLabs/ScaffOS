import { IStorage } from './IStorage';

export class InMemoryStorage<T> implements IStorage<T> {
    private storage: Record<string, T> = {};
    private currentId = 0;

    async create(item: T): Promise<T> {
        const id = String(++this.currentId);
        this.storage[id] = { ...item, id } as T;
        return this.storage[id];
    }

    async read(id: string): Promise<T | null> {
        return this.storage[id] || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.storage[id]) return null;
        this.storage[id] = { ...this.storage[id], ...item };
        return this.storage[id];
    }

    async delete(id: string): Promise<boolean> {
        if (!this.storage[id]) return false;
        delete this.storage[id];
        return true;
    }

    async findAll(limit = 10, offset = 0): Promise<T[]> {
        return Object.values(this.storage).slice(offset, offset + limit);
    }

    async transaction(operations: (() => Promise<void>)[]): Promise<void> {
        const results: Promise<void>[] = operations.map(op => op());
        await Promise.all(results);
    }
}