import { RiskPosition } from './sharedTypes';

export interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findAll(limit?: number, offset?: number): Promise<T[]>;
}

export class InMemoryStorage<T> implements Storage<T> {
    private items: Map<string, T> = new Map();
    private ids: string[] = [];

    async create(item: T): Promise<T> {
        const id = this.generateId();
        (item as any).id = id;
        this.items.set(id, item);
        this.ids.push(id);
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
        if (!this.items.has(id)) return false;
        this.items.delete(id);
        this.ids = this.ids.filter(existingId => existingId !== id);
        return true;
    }

    async findAll(limit?: number, offset?: number): Promise<T[]> {
        const itemsArray = Array.from(this.items.values());
        return itemsArray.slice(offset || 0, (limit ? (offset || 0) + limit : itemsArray.length));
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export class RiskPositionStorage extends InMemoryStorage<RiskPosition> {}