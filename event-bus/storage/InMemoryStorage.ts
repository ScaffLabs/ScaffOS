import { IStorage } from './IStorage';
import { Event } from '../types';

export class InMemoryStorage<T> implements IStorage<T> {
    private storage: Record<string, T & { id: string }> = {};
    private currentId = 0;

    async create(item: T): Promise<T & { id: string }> {
        const id = String(++this.currentId);
        this.storage[id] = { ...item, id } as T & { id: string };
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

    async findAll(limit: number = 10, offset: number = 0): Promise<T[]> {
        return Object.values(this.storage).slice(offset, offset + limit);
    }

    async transaction(operations: (() => Promise<void>)[]): Promise<void> {
        const results = [];
        for (const operation of operations) {
            results.push(await operation());
        }
        return results;
    }

    async migrate(): Promise<void> {
        console.log('Migration utility called.');
        // Implement migration logic
    }

    async seedData(): Promise<void> {
        console.log('Seeding data...');
        // Implement seeding logic
    }

    async findByField(field: keyof T, value: any): Promise<T[]> {
        return Object.values(this.storage).filter(item => item[field] === value);
    }
}
