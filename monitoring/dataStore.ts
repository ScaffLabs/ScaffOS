import { ValidationError } from './errorClasses';

interface Entity<T> {
    id: string;
    data: T;
}

class InMemoryStore<T> {
    private storage: Map<string, Entity<T>> = new Map();
    private index: Map<string, Set<string>> = new Map();

    public create(entity: T, id: string): void {
        if (this.storage.has(id)) {
            throw new ValidationError('Entity with this ID already exists.');
        }
        this.storage.set(id, { id, data: entity });
        this.indexEntity(entity, id);
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

    public query(indexKey: string, value: string): T[] {
        const ids = this.index.get(indexKey)?.has(value) ? this.index.get(indexKey) : new Set();
        return Array.from(ids).map(id => this.read(id)).filter((data): data is T => data !== null);
    }

    public transaction(operations: Array<{ type: 'create' | 'update' | 'delete'; entity: T; id?: string }>): void {
        const snapshots = new Map(this.storage); // Create a snapshot of current state
        try {
            operations.forEach(op => {
                if (op.type === 'create') {
                    this.create(op.entity, op.id!);
                } else if (op.type === 'update') {
                    this.update(op.id!, op.entity);
                } else if (op.type === 'delete') {
                    this.delete(op.id!);
                }
            });
        } catch (error) {
            this.storage = snapshots; // Revert to previous state on error
            throw error;
        }
    }

    private indexEntity(entity: T, id: string): void {
        const key = (entity as any).someProperty;
        if (!this.index.has(key)) {
            this.index.set(key, new Set());
        }
        this.index.get(key)!.add(id);
    }
}

export default InMemoryStore;