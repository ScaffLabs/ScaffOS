import { Order } from './types';

export interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(): Promise<T[]>;
}

export class InMemoryStorage<T extends { id: string }> implements Storage<T> {
    private items: T[] = [];

    public async create(item: T): Promise<T> {
        this.items.push(item);
        return item;
    }

    public async read(id: string): Promise<T | null> {
        return this.items.find(item => item.id === id) || null;
    }

    public async update(id: string, item: T): Promise<T | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return null;
        this.items[index] = { ...this.items[index], ...item };
        return this.items[index];
    }

    public async delete(id: string): Promise<void> {
        this.items = this.items.filter(item => item.id !== id);
    }

    public async findAll(): Promise<T[]> {
        return this.items;
    }
}

export const storage = new InMemoryStorage<Order>();