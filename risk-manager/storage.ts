import { RiskPosition } from './sharedTypes';

export interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findAll(limit?: number, offset?: number): Promise<T[]>;
    transaction(operations: Array<() => Promise<any>>): Promise<void>;
}

export class InMemoryStorage<T> implements Storage<T> {
    private items: Map<string, T> = new Map();

    async create(item: T): Promise<T> {
        const id = this.generateId();
        (item as any).id = id;
        this.items.set(id, item);
        return item;
    }

    async read(id: string): Promise<T | null> {
        return this.items.get(id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.items.has(id)) return null;
        this.items.set(id, { ...this.items.get(id), ...item });
        return this.items.get(id) as T;
    }

    async delete(id: string): Promise<boolean> {
        return this.items.delete(id);
    }

    async findAll(limit?: number, offset?: number): Promise<T[]> {
        const itemsArray = Array.from(this.items.values());
        return itemsArray.slice(offset || 0, (limit ? (offset || 0) + limit : itemsArray.length));
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    async transaction(operations: Array<() => Promise<any>>): Promise<void> {
        const results: any[] = [];
        try {
            for (const operation of operations) {
                results.push(await operation());
            }
        } catch (error) {
            throw new Error('Transaction failed: ' + error);
        }
    }

    async reset() {
        this.items.clear();
    }
}