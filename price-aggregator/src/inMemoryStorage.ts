import { PriceData } from './types';

interface InMemoryStorage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryStorage<T extends { id: string }> implements InMemoryStorage<T> {
    private data: T[] = [];

    async create(item: T): Promise<T> {
        this.data.push(item);
        return item;
    }

    async read(id: string): Promise<T | null> {
        return this.data.find(item => item.id === id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        const index = this.data.findIndex(existing => existing.id === id);
        if (index === -1) return null;
        this.data[index] = { ...item, id };
        return this.data[index];
    }

    async delete(id: string): Promise<void> {
        this.data = this.data.filter(item => item.id !== id);
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        return this.data.filter(item => {
            return Object.entries(query || {}).every(([key, value]) => item[key] === value);
        });
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const snapshot = [...this.data];
        try {
            await operations();
        } catch (error) {
            this.data = snapshot; // Rollback on error
            throw error;
        }
    }
}

const inMemoryStorage = new InMemoryStorage<PriceData>();
export default inMemoryStorage;