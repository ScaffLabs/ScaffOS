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
        Object.keys(entity.data).forEach(key => {
            const indexKey = entity.data[key];
            if (!this.index.has(indexKey)) {
                this.index.set(indexKey, new Set());
            }
            this.index.get(indexKey)!.add(entity.id);
        });
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
            const entity = this.store.get(id);
            if (entity) {
                this.index.delete(entity.data);
            }
            this.store.delete(id);
            logger.info({ message: 'Deleted entity', id });
            return true;
        }
        return false;
    }

    async findAll(): Promise<Entity<T>[]> {
        return Array.from(this.store.values());
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results: Array<any> = [];
        for (const operation of operations) {
            const result = await operation();
            results.push(result);
        }
        return results;
    }

    async migrate(data: T[]): Promise<void> {
        for (const item of data) {
            await this.create(item);
        }
        logger.info('Migration completed for in-memory store.');
    }

    async findByIndex(indexKey: string): Promise<Entity<T>[]> {
        const ids = this.index.get(indexKey);
        if (!ids) return [];
        return Array.from(ids).map(id => this.store.get(id)).filter(Boolean) as Entity<T>[];
    }
}