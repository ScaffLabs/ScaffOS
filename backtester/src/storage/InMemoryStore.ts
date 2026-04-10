import { v4 as uuidv4 } from 'uuid';
import { StorageInterface, TransactionOperation, TransactionResult } from './StorageInterface';
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
        logger.warn({ message: 'Update failed, entity not found', id });
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        const exists = this.store.delete(id);
        if (exists) {
            logger.info({ message: 'Deleted entity', id });
        } else {
            logger.warn({ message: 'Deletion failed, entity not found', id });
        }
        return exists;
    }

    async findAll(): Promise<Entity<T>[]> {
        return Array.from(this.store.values());
    }

    async transaction(operations: TransactionOperation[]): Promise<TransactionResult> {
        const results = [];
        for (const operation of operations) {
            switch (operation.type) {
                case 'create':
                    if (operation.data) {
                        const created = await this.create(operation.data);
                        results.push(created);
                    }
                    break;
                case 'update':
                    if (operation.id && operation.data) {
                        const updated = await this.update(operation.id, operation.data);
                        results.push(updated);
                    }
                    break;
                case 'delete':
                    if (operation.id) {
                        await this.delete(operation.id);
                        results.push({ success: true });
                    }
                    break;
            }
        }
        return { success: true, results };
    }

    async migrate(data: T[]): Promise<void> {
        await Promise.all(data.map(item => this.create(item)));
    }

    async findByIndex(indexKey: keyof T, value: any): Promise<Entity<T>[]> {
        return Array.from(this.store.values()).filter(entity => entity.data[indexKey] === value);
    }
}