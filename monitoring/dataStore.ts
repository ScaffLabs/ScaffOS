import { ValidationError } from './errorClasses';
import { DashboardEntry } from './types';

interface Entity<T> {
    id: string;
    data: T;
}

class InMemoryStore<T> {
    private storage: Map<string, Entity<T>> = new Map();

    public create(entity: T, id: string): void {
        if (this.storage.has(id)) {
            throw new ValidationError('Entity with this ID already exists.');
        }
        this.storage.set(id, { id, data: entity });
    }

    public read(id: string): T | null {
        const entity = this.storage.get(id);
        return entity ? entity.data : null;
    }

    public update(id: string, entity: T): void {
        if (!this.storage.has(id)) {
            throw new ValidationError('Entity not found.');
        }
        this.storage.set(id, { id, data: entity });
    }

    public delete(id: string): void {
        if (!this.storage.has(id)) {
            throw new ValidationError('Entity not found.');
        }
        this.storage.delete(id);
    }

    public getAll(): Entity<T>[] {
        return Array.from(this.storage.values());
    }

    public clear(): void {
        this.storage.clear();
    }
}

export default InMemoryStore;