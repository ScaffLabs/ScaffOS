import { EventEmitter } from 'events';
import { Order, OrderId } from './types';

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
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.reject(new Error('Order not found.'));
        this.items.splice(index, 1);
        this.eventEmitter.emit('ORDER_DELETED', id);
        return Promise.resolve();
    }

    public findAll(): Promise<T[]> {
        return Promise.resolve(this.items);
    }

    public transaction(callback: (storage: this) => Promise<void>): Promise<void> {
        return callback(this);
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

    public indexByStatus(): Record<string, T[]> {
        return this.items.reduce((acc, item) => {
            if (!acc[item.status]) {
                acc[item.status] = [];
            }
            acc[item.status].push(item);
            return acc;
        }, {} as Record<string, T[]>);
    }
}

export const storage = new InMemoryStorage<Order>();

export const migrateOrders = async (data: Order[]): Promise<void> => {
    for (const order of data) {
        await storage.create(order);
    }
};

export const seedData = async (): Promise<void> => {
    const initialOrders: Order[] = [
        { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' },
        { id: '2' as OrderId, type: 'market', price: 0, quantity: 5, status: 'open' }
    ];
    await migrateOrders(initialOrders);
};
