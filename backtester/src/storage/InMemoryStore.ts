import { v4 as uuidv4 } from 'uuid';
import { StorageInterface } from './StorageInterface';
import logger from '../utils/logger';

interface Entity<T> {
    id: string;
    data: T;
}

export class InMemoryStore<T> implements StorageInterface<T> {
    private store: Map<string, Entity<T>> = new Map();
    private index: Map<string, Set<string>> = new Map();

    async create(data: T): Promise<Entity<T>> {
        const id = uuidv4();
        const entity = { id, data };
        this.store.set(id, entity);
        this.indexData(entity);
        logger.info({ message: 'Created entity', id, data });
        return entity;
    }

    private indexData(entity: Entity<T>): void {
        // Indexing based on a specific field for efficient queries
        const indexKey = (entity.data as any).indexKey; // Adjust as necessary
        if (!this.index.has(indexKey)) {
            this.index.set(indexKey, new Set());
        }
        this.index.get(indexKey)?.add(entity.id);
    }

    async read(id: string): Promise<Entity<T> | undefined> {
        logger.debug({ message: 'Reading entity', id });
        return this.store.get(id);
    }

    async update(id: string, data: T): Promise<Entity<T> | undefined> {
        const entity = this.store.get(id);
        if (entity) {
            entity.data = data;
            this.indexData(entity);
            logger.info({ message: 'Updated entity', id });
            return entity;
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        if (this.store.has(id)) {
            this.store.delete(id);
            this.indexDataAfterDelete(id);
            logger.info({ message: 'Deleted entity', id });
            return true;
        }
        return false;
    }

    private indexDataAfterDelete(id: string): void {
        // Remove index entry for the deleted entity
        this.index.forEach((ids, key) => {
            ids.delete(id);
            if (ids.size === 0) {
                this.index.delete(key);
            }
        });
    }

    async findAll(): Promise<Entity<T>[]> {
        return Array.from(this.store.values());
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results = [];
        for (const operation of operations) {
            results.push(await operation());
        }
    }

    async migrate(data: T[]): Promise<void> {
        await Promise.all(data.map(item => this.create(item)));
    }
}