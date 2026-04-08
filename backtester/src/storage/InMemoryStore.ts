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

    async findAll(): Promise<Entity<T>[]> {
        return Array.from(this.store.values());
    }

    async findPaginated(limit: number, offset: number): Promise<Entity<T>[]> {
        const entities = Array.from(this.store.values());
        return entities.slice(offset, offset + limit);
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
        if (this.store.has(id)) {
            this.store.delete(id);
            logger.info({ message: 'Deleted entity', id });
            return true;
        }
        return false;
    }
}