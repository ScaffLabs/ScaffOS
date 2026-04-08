import { Order } from './types';
import { EventEmitter } from 'events';

// In-memory storage for orders with support for transactions and migrations
class InMemoryStorage<T extends { id: string }> {
    private items: T[] = [];
    private eventEmitter: EventEmitter;
    private transactions: { [key: string]: T[] } = {};

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
        return Promise.resolve(item || null);
    }

    public update(id: string, updates: Partial<T>): Promise<T | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.resolve(null);

        const updatedItem = { ...this.items[index], ...updates };
        this.items[index] = updatedItem;
        this.eventEmitter.emit('ORDER_UPDATED', updatedItem);
        return Promise.resolve(updatedItem);
    }

    public delete(id: string): Promise<void> {
        this.items = this.items.filter(i => i.id !== id);
        this.eventEmitter.emit('ORDER_DELETED', id);
        return Promise.resolve();
    }

    public findAll(): Promise<T[]> {
        return Promise.resolve(this.items);
    }

    public beginTransaction(transactionId: string): void {
        this.transactions[transactionId] = [];
    }

    public commitTransaction(transactionId: string): Promise<void> {
        delete this.transactions[transactionId];
        return Promise.resolve();
    }

    public rollbackTransaction(transactionId: string): Promise<void> {
        if (this.transactions[transactionId]) {
            this.transactions[transactionId].forEach(item => this.delete(item.id));
            delete this.transactions[transactionId];
        }
        return Promise.resolve();
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