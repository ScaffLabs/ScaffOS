import { Order } from './types';
import { EventEmitter } from 'events';

class InMemoryStorage<T extends { id: string }> {
    private items: T[] = [];
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public create(item: T): Promise<T> {
        this.items.push(item);
        this.eventEmitter.emit('ORDER_CREATED', item);
        return Promise.resolve(item);
    }

    public read(id: string): Promise<T | null> {
        const item = this.items.find(i => i.id === id);
        if (!item) {
            throw new Error('Order not found.');
        }
        return Promise.resolve(item);
    }

    public update(id: string, updates: Partial<T>): Promise<T | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Order not found.');

        const updatedItem = { ...this.items[index], ...updates };
        this.items[index] = updatedItem;
        this.eventEmitter.emit('ORDER_UPDATED', updatedItem);
        return Promise.resolve(updatedItem);
    }

    public delete(id: string): Promise<void> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Order not found.');
        this.items.splice(index, 1);
        this.eventEmitter.emit('ORDER_DELETED', id);
        return Promise.resolve();
    }

    public findAll(): Promise<T[]> {
        return Promise.resolve(this.items);
    }

    public onOrderCreated(listener: (order: T) => void): void {
        this.eventEmitter.on('ORDER_CREATED', listener);
    }

    public onOrderUpdated(listener: (order: T) => void): void {
        this.eventEmitter.on('ORDER_UPDATED', listener);
    }

    public onOrderDeleted(listener: (id: string) => void): void {
        this.eventEmitter.on('ORDER_DELETED', listener);
    }
}

export const storage = new InMemoryStorage<Order>();