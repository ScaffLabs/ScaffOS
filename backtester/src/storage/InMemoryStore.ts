import { v4 as uuidv4 } from 'uuid';
import { StorageInterface } from './StorageInterface';
import logger from '../utils/logger';

interface Entity<T> {
    id: string;
    data: T;
}

export class InMemoryStore<T> implements StorageInterface<T> {
    private store: Map<string, Entity<T>> = new Map();

    async create(data: T): Promise<Entity<T>> {
        const id = uuidv4();
        const entity = { id, data };
        this.store.set(id, entity);
        logger.info({ message: 'Created entity', id, data });
        return entity;
    }

    async read(id: string): Promise<Entity<T> | undefined> {
        logger.debug({ message: 'Reading entity', id });
        return this.store.get(id);
    }

    async update(id: string, data: T): Promise<Entity<T> | undefined> {
        const entity = this.store.get(id);
        if (entity) {
            entity.data = data;
            logger.info({ message: 'Updated entity', id });
            return entity;
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        logger.info({ message: 'Deleting entity', id });
        return this.store.delete(id);
    }

    async findAll(): Promise<Entity<T>[]> {
        return Array.from(this.store.values());
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results = [];
        for (const operation of operations) {
            results.push(await operation());
        }
        return results;
    }

    async migrate(data: T[]): Promise<void> {
        await Promise.all(data.map(item => this.create(item)));
    }
}