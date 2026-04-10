import { EventEmitter } from 'events';
import { Order, OrderId } from './types';

interface Database<T> {
    create(item: T): Promise<T>;
    read(id: OrderId): Promise<T | null>;
    update(id: OrderId, updates: Partial<T>): Promise<T | null>;
    delete(id: OrderId): Promise<void>;
    findAll(): Promise<T[]>;
    findBy(criteria: Partial<T>): Promise<T[]>;
}

class InMemoryStorage<T extends { id: string }> implements Database<T> {
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

    public read(id: OrderId): Promise<T | null> {
        const item = this.items.find(i => i.id === id);
        return Promise.resolve(item || null);
    }

    public update(id: OrderId, updates: Partial<T>): Promise<T | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.resolve(null);

        const updatedItem = { ...this.items[index], ...updates }; 
        this.items[index] = updatedItem; 
        this.eventEmitter.emit('ORDER_UPDATED', updatedItem); 
        return Promise.resolve(updatedItem);
    }

    public delete(id: OrderId): Promise<void> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.reject(new Error('Order not found.'));
        this.items.splice(index, 1);
        this.eventEmitter.emit('ORDER_DELETED', id);
        return Promise.resolve();
    }

    public findAll(): Promise<T[]> {
        return Promise.resolve(this.items);
    }

    public findBy(criteria: Partial<T>): Promise<T[]> {
        const result = this.items.filter(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
        return Promise.resolve(result);
    }

    public on(event: string, listener: (item: T) => void): void {
        this.eventEmitter.on(event, listener);
    }

    public off(event: string, listener: (item: T) => void): void {
        this.eventEmitter.off(event, listener);
    }
}

export const storage = new InMemoryStorage<Order>();
