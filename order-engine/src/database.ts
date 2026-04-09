import { Order } from './types';

interface Database<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, updates: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(): Promise<T[]>;
}

export class InMemoryDatabase implements Database<Order> {
    private items: Order[] = [];

    public create(item: Order): Promise<Order> {
        this.items.push(item);
        return Promise.resolve(item);
    }

    public read(id: string): Promise<Order | null> {
        const item = this.items.find(i => i.id === id);
        return Promise.resolve(item || null);
    }

    public update(id: string, updates: Partial<Order>): Promise<Order | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.resolve(null);

        const updatedItem = { ...this.items[index], ...updates };
        this.items[index] = updatedItem;
        return Promise.resolve(updatedItem);
    }

    public delete(id: string): Promise<void> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.reject(new Error('Order not found.'));
        this.items.splice(index, 1);
        return Promise.resolve();
    }

    public findAll(): Promise<Order[]> {
        return Promise.resolve(this.items);
    }
}

export const database = new InMemoryDatabase();