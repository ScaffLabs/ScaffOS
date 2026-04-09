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
}